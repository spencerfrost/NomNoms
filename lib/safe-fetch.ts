/**
 * Server-side fetch for user-supplied URLs (recipe import).
 *
 * Guards against SSRF: only http(s) on default ports, every hostname is resolved and
 * rejected if any address is private/loopback/link-local/etc., redirects are followed
 * manually so each hop is re-checked, and responses are bounded by time and size.
 *
 * Note: there is still a small DNS-rebinding window between our lookup and fetch's own
 * lookup. Closing that fully requires pinning the resolved IP in a custom agent.
 */
import { lookup } from 'node:dns/promises';
import net from 'node:net';

const MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export class UnsafeUrlError extends Error {
  constructor(message = 'Invalid URL format') {
    super(message);
    this.name = 'UnsafeUrlError';
  }
}

export type FetchErrorKind =
  | 'unresolvable' // DNS lookup failed
  | 'timeout'
  | 'http' // non-2xx final response; see `status`
  | 'too_large'
  | 'too_many_redirects'
  | 'network'; // connection refused/reset, TLS failure, etc.

/** A fetch that failed for a reason callers may want to report differently. */
export class FetchError extends Error {
  readonly kind: FetchErrorKind;
  /** HTTP status, for kind 'http'. */
  readonly status?: number;

  constructor(kind: FetchErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'FetchError';
    this.kind = kind;
    this.status = status;
  }
}

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

const BLOCKED_V4: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function isBlockedIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return BLOCKED_V4.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (n & mask) === (ipv4ToInt(base) & mask);
  });
}

function isBlockedIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  // IPv4-mapped (::ffff:a.b.c.d)
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIPv4(mapped[1]);
  if (lower === '::' || lower === '::1') return true;
  const first = parseInt(lower.split(':')[0] || '0', 16);
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((first & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (lower.startsWith('64:ff9b:')) return true; // NAT64
  if (lower.startsWith('2001:db8:')) return true; // documentation
  return false;
}

export function isBlockedAddress(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isBlockedIPv4(ip);
  if (family === 6) return isBlockedIPv6(ip);
  return true;
}

export async function assertSafeUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError();
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new UnsafeUrlError();
  if (url.username || url.password) throw new UnsafeUrlError();
  if (url.port && url.port !== '80' && url.port !== '443') throw new UnsafeUrlError();

  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host)) {
    if (isBlockedAddress(host)) throw new UnsafeUrlError();
    return url;
  }
  if (!host.includes('.') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new UnsafeUrlError();
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new FetchError('unresolvable', `Could not resolve host ${host}`);
  }
  if (addresses.length === 0 || addresses.some(a => isBlockedAddress(a.address))) {
    throw new UnsafeUrlError();
  }
  return url;
}

export async function safeFetchText(
  rawUrl: string,
  init: { headers?: Record<string, string>; timeoutMs?: number; maxBytes?: number } = {}
): Promise<{ text: string; finalUrl: string }> {
  const { headers, timeoutMs = DEFAULT_TIMEOUT_MS, maxBytes = DEFAULT_MAX_BYTES } = init;
  const signal = AbortSignal.timeout(timeoutMs);

  let current = rawUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertSafeUrl(current);

    let response: Response;
    try {
      response = await fetch(url, { headers, redirect: 'manual', signal });
    } catch (err) {
      if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
        throw new FetchError('timeout', 'Request timeout');
      }
      throw new FetchError('network', err instanceof Error ? err.message : String(err));
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new FetchError('http', 'Redirect without location', response.status);
      }
      current = new URL(location, url).href;
      continue;
    }

    if (!response.ok) {
      throw new FetchError(
        'http',
        `Failed to fetch URL: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const declared = Number(response.headers.get('content-length'));
    if (declared && declared > maxBytes) throw new FetchError('too_large', 'Response too large');

    if (!response.body) return { text: '', finalUrl: url.href };
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new FetchError('too_large', 'Response too large');
      }
      chunks.push(value);
    }
    const buf = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      buf.set(c, offset);
      offset += c.byteLength;
    }
    return { text: new TextDecoder().decode(buf), finalUrl: url.href };
  }
  throw new FetchError('too_many_redirects', 'Too many redirects');
}
