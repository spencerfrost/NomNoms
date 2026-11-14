/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';

jest.mock('@/lib/prisma', () => ({ prisma: { $queryRaw: jest.fn() } }));
const mockQuery = prisma.$queryRaw as unknown as jest.Mock;

const rule = { limit: 3, windowMs: 60_000 };

beforeEach(() => jest.resetAllMocks());

describe('rateLimit', () => {
  it('allows requests up to the limit', async () => {
    mockQuery.mockResolvedValue([{ count: 3, retryAfterMs: 30_000 }]);
    await expect(rateLimit('k', rule)).resolves.toEqual({ allowed: true, retryAfterSeconds: 30 });
  });

  it('rejects requests over the limit with a Retry-After from the window end', async () => {
    mockQuery.mockResolvedValue([{ count: 4, retryAfterMs: 12_300 }]);
    await expect(rateLimit('k', rule)).resolves.toEqual({ allowed: false, retryAfterSeconds: 13 });
  });

  it('passes the key and window to a single atomic upsert', async () => {
    mockQuery.mockResolvedValue([{ count: 1, retryAfterMs: 60_000 }]);
    await rateLimit('signup:1.2.3.4', rule);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [strings, ...values] = mockQuery.mock.calls[0];
    expect(strings.join('?')).toMatch(/ON CONFLICT \("key"\) DO UPDATE/);
    expect(values).toEqual(['signup:1.2.3.4', 60_000]);
  });

  it('fails open when the check itself errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery.mockRejectedValue(new Error('relation "rate_limits" does not exist'));
    await expect(rateLimit('k', rule)).resolves.toEqual({ allowed: true, retryAfterSeconds: 0 });
  });
});

describe('clientIp', () => {
  it('prefers x-real-ip', () => {
    const h = new Headers({ 'x-real-ip': '198.51.100.1', 'x-forwarded-for': '203.0.113.9' });
    expect(clientIp(h)).toBe('198.51.100.1');
  });

  it('uses the first x-forwarded-for entry', () => {
    expect(clientIp({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' })).toBe('203.0.113.9');
  });

  it('falls back to "unknown"', () => {
    expect(clientIp(undefined)).toBe('unknown');
    expect(clientIp(new Headers())).toBe('unknown');
  });
});

describe('tooManyRequests', () => {
  it('returns 429 with Retry-After', async () => {
    const res = tooManyRequests({ allowed: false, retryAfterSeconds: 42 }, 'Slow down');
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('42');
    await expect(res.json()).resolves.toEqual({ error: 'Slow down' });
  });
});
