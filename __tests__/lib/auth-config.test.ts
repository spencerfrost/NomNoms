/**
 * @jest-environment node
 */
import { verifyPassword } from '@/lib/users-db';
import { rateLimit } from '@/lib/rate-limit';

// Use the raw options object instead of the real provider, which pulls in ESM-only deps.
jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: (options: unknown) => options,
}));
jest.mock('@/lib/users-db', () => ({ verifyPassword: jest.fn() }));
// Keep the real clientIp/RATE_LIMITS; stub Prisma so loading them doesn't need env vars.
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/lib/rate-limit', () => ({
  ...jest.requireActual('@/lib/rate-limit'),
  rateLimit: jest.fn(),
}));

import { authOptions, AUTH_RATE_LIMITED_ERROR, AUTH_UNAVAILABLE_ERROR } from '@/lib/auth-config';

const mockVerify = verifyPassword as jest.Mock;
const mockRateLimit = rateLimit as jest.Mock;
const authorize = (authOptions.providers[0] as unknown as {
  authorize: (
    _credentials: Record<string, string> | undefined,
    _req?: { headers?: Record<string, string> }
  ) => Promise<unknown>;
}).authorize;

beforeEach(() => {
  jest.resetAllMocks();
  mockRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
});

describe('credentials rate limiting', () => {
  it('limits by normalized email and by client IP', async () => {
    mockVerify.mockResolvedValue(null);
    await authorize(
      { email: ' A@B.com ', password: 'pw' },
      { headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } }
    );
    const keys = mockRateLimit.mock.calls.map(([key]) => key);
    expect(keys).toEqual(['login-email:a@b.com', 'login-ip:203.0.113.9']);
  });

  it('throws RateLimited without checking the password when over the limit', async () => {
    mockRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 60 });
    await expect(authorize({ email: 'a@b.com', password: 'pw' })).rejects.toThrow(
      AUTH_RATE_LIMITED_ERROR
    );
    expect(mockVerify).not.toHaveBeenCalled();
  });
});

describe('credentials authorize', () => {
  it('returns null for wrong credentials (reported to the client as CredentialsSignin)', async () => {
    mockVerify.mockResolvedValue(null);
    await expect(authorize({ email: 'a@b.com', password: 'nope' })).resolves.toBeNull();
  });

  it('throws AuthUnavailable when the database fails, so it is not shown as a bad password', async () => {
    mockVerify.mockRejectedValue(new Error('db down'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(authorize({ email: 'a@b.com', password: 'pw' })).rejects.toThrow(
      AUTH_UNAVAILABLE_ERROR
    );
  });

  it('returns only public user fields on success', async () => {
    mockVerify.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      role: 'user',
      password: 'hash',
    });
    await expect(authorize({ email: 'a@b.com', password: 'pw' })).resolves.toEqual({
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      role: 'user',
    });
  });

  it('returns null without hitting the database when fields are missing', async () => {
    await expect(authorize({ email: '', password: '' })).resolves.toBeNull();
    expect(mockVerify).not.toHaveBeenCalled();
    expect(mockRateLimit).not.toHaveBeenCalled();
  });
});
