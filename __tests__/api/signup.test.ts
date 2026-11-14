/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler'; // Must be first import
import { createUser, UserExistsError } from '@/lib/users-db';
import { rateLimit } from '@/lib/rate-limit';

jest.mock('@/lib/users-db', () => ({
  createUser: jest.fn(),
  UserExistsError: class UserExistsError extends Error {},
}));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/lib/rate-limit', () => ({
  ...jest.requireActual('@/lib/rate-limit'),
  rateLimit: jest.fn(),
}));

import * as appHandler from '@/app/api/auth/signup/route';

const mockCreate = createUser as jest.Mock;
const mockRateLimit = rateLimit as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  mockRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
});

const valid = { email: 'a@b.com', password: 'password1', name: 'A' };

async function post(body: unknown, headers: Record<string, string> = {}) {
  let result: { status: number; json: Record<string, unknown> } | undefined;
  await testApiHandler({
    appHandler,
    test: async ({ fetch }) => {
      const res = await fetch({
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      result = { status: res.status, json: await res.json() };
    },
  });
  return result!;
}

describe('POST /api/auth/signup', () => {
  it('creates the user', async () => {
    mockCreate.mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'A', role: 'user' });
    expect((await post(valid)).status).toBe(201);
  });

  it('answers 409 when the email is taken, including after a lost race', async () => {
    mockCreate.mockRejectedValue(new UserExistsError());
    expect((await post(valid)).status).toBe(409);
  });

  it('enforces the minimum password length', async () => {
    const res = await post({ ...valid, password: 'short12' });
    expect(res.status).toBe(400);
    expect(res.json.error).toMatch(/at least 8/);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rate limits by client IP before doing any work', async () => {
    mockRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 3600 });
    const res = await post(valid, { 'x-real-ip': '198.51.100.7' });
    expect(res.status).toBe(429);
    expect(mockRateLimit).toHaveBeenCalledWith('signup:198.51.100.7', expect.anything());
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
