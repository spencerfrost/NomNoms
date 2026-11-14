/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler'; // Must be first import
import { getServerSession } from 'next-auth';
import { rateLimit } from '@/lib/rate-limit';
import { RecipeImportError, scrapeRecipeFromUrl } from '@/lib/recipe-import-utils';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth-config', () => ({ authOptions: {} }));
jest.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: { recipeImport: { limit: 20, windowMs: 600_000 } },
  rateLimit: jest.fn(),
  tooManyRequests: jest.requireActual('@/lib/rate-limit').tooManyRequests,
}));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/lib/recipe-import-utils', () => ({
  ...jest.requireActual('@/lib/recipe-import-utils'),
  scrapeRecipeFromUrl: jest.fn(),
}));

import * as appHandler from '@/app/api/recipes/import/route';

const mockSession = getServerSession as jest.Mock;
const mockRateLimit = rateLimit as jest.Mock;
const mockScrape = scrapeRecipeFromUrl as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  mockSession.mockResolvedValue({ user: { id: 'u1' } });
  mockRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
});

async function post(body: string) {
  let result: { status: number; json: Record<string, unknown>; headers: Headers } | undefined;
  await testApiHandler({
    appHandler,
    test: async ({ fetch }) => {
      const res = await fetch({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      });
      result = { status: res.status, json: await res.json(), headers: res.headers };
    },
  });
  return result!;
}

describe('POST /api/recipes/import', () => {
  it('requires a signed-in user', async () => {
    mockSession.mockResolvedValue(null);
    expect((await post('{"url":"https://example.com"}')).status).toBe(401);
  });

  it('answers 400 for a malformed body instead of 500', async () => {
    expect((await post('{not json')).status).toBe(400);
    expect((await post('{"url":42}')).status).toBe(400);
    expect(mockScrape).not.toHaveBeenCalled();
  });

  it('rate limits per user', async () => {
    mockRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 90 });
    const res = await post('{"url":"https://example.com"}');
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('90');
    expect(mockRateLimit).toHaveBeenCalledWith('import:u1', expect.anything());
    expect(mockScrape).not.toHaveBeenCalled();
  });

  it('returns the scraped recipe', async () => {
    mockScrape.mockResolvedValue({ name: 'Pancakes' });
    const res = await post('{"url":" https://example.com/r "}');
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ name: 'Pancakes' });
    expect(mockScrape).toHaveBeenCalledWith('https://example.com/r');
  });

  it.each([
    ['invalid_url', 400],
    ['unreachable', 422],
    ['not_found', 422],
    ['no_recipe', 422],
    ['blocked', 502],
    ['fetch_failed', 502],
    ['timeout', 504],
  ] as const)('maps %s to %i', async (code, status) => {
    mockScrape.mockRejectedValue(new RecipeImportError(code));
    const res = await post('{"url":"https://example.com/r"}');
    expect(res.status).toBe(status);
    expect(res.json.code).toBe(code);
    expect(typeof res.json.error).toBe('string');
  });

  it('hides internal error text on unexpected failures', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockScrape.mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.5:5432'));
    const res = await post('{"url":"https://example.com/r"}');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.json)).not.toContain('ECONNREFUSED');
  });
});
