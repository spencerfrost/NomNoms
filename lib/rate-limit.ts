/**
 * Fixed-window rate limiting backed by Postgres (`rate_limits` table).
 *
 * In-memory counters don't work on Vercel: each serverless instance has its own memory and
 * instances come and go. One atomic upsert per check keeps the count shared and race-free,
 * and uses the database clock so instances don't disagree about when a window ends.
 *
 * Fails open: if the check itself errors, the request is allowed and the error is logged,
 * so a limiter problem can't take sign-in or signup down with it.
 */
import { NextResponse } from 'next/server';
import { prisma } from './prisma';

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const MINUTE = 60_000;

export const RATE_LIMITS = {
  // Per IP: account creation.
  signup: { limit: 5, windowMs: 60 * MINUTE },
  // Per email: guessing one account's password. Also lets someone delay a victim's sign-in
  // for one window; that's the accepted cost of stopping targeted guessing.
  loginEmail: { limit: 10, windowMs: 15 * MINUTE },
  // Per IP: spraying many accounts from one source.
  loginIp: { limit: 50, windowMs: 15 * MINUTE },
  // Per user: each import makes the server fetch a third-party URL.
  recipeImport: { limit: 20, windowMs: 10 * MINUTE },
  // Per user: guessing the current password on the profile form.
  passwordChange: { limit: 10, windowMs: 15 * MINUTE },
} satisfies Record<string, RateLimitRule>;

export async function rateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<{ count: number; retryAfterMs: number }[]>`
      INSERT INTO "rate_limits" ("key", "count", "resetAt")
      VALUES (${key}, 1, NOW() + (${rule.windowMs}::int * INTERVAL '1 millisecond'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "rate_limits"."resetAt" <= NOW() THEN 1
                       ELSE "rate_limits"."count" + 1 END,
        "resetAt" = CASE WHEN "rate_limits"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
                         ELSE "rate_limits"."resetAt" END
      RETURNING "count", (EXTRACT(EPOCH FROM ("resetAt" - NOW())) * 1000)::float8 AS "retryAfterMs"
    `;
    const row = rows[0];
    if (!row) return { allowed: true, retryAfterSeconds: 0 };
    return {
      allowed: row.count <= rule.limit,
      retryAfterSeconds: Math.max(1, Math.ceil(row.retryAfterMs / 1000)),
    };
  } catch (error) {
    console.error(`Rate limit check failed for ${key.split(':')[0]}:`, error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

type HeaderSource = Headers | Record<string, string | string[] | undefined> | undefined;

function readHeader(headers: HeaderSource, name: string): string | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) return headers.get(name) ?? undefined;
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Best-effort client IP. Vercel sets x-real-ip and overwrites x-forwarded-for, so these are
 * trustworthy there. Self-hosted without a proxy that does the same, clients can spoof them.
 */
export function clientIp(headers: HeaderSource): string {
  const real = readHeader(headers, 'x-real-ip')?.trim();
  if (real) return real;
  const forwarded = readHeader(headers, 'x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || 'unknown';
}

export function tooManyRequests(result: RateLimitResult, message?: string): NextResponse {
  return NextResponse.json(
    { error: message ?? 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfterSeconds) } }
  );
}
