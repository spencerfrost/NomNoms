import { Prisma } from '@prisma/client';

/**
 * True when `error` is a unique-constraint violation (P2002), optionally only on `field`.
 * Use this instead of check-then-insert, which races under concurrent requests.
 */
export function isUniqueViolation(error: unknown, field?: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return false;
  }
  if (!field) return true;
  const target = error.meta?.target;
  // Postgres reports the column list; some drivers report the index name instead.
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === 'string') return target.includes(field);
  return true;
}
