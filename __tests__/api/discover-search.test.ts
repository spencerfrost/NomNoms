/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler'; // Must be first import
import { getServerSession } from 'next-auth';
import { rateLimit } from '@/lib/rate-limit';
import { RecipeSearchError, isSearchConfigured, searchRecipes } from '@/lib/recipe-search';
import { findSavedSlugsBySourceUrl } from '@/lib/recipes-db';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth-config', () => ({ authOptions: {} }));
jest.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: { recipeSearch: { limit: 30, windowMs: 600_000 } },
  rateLimit: jest.fn(),
  tooManyRequests: jest.requireActual('@/lib/rate-limit').tooManyRequests,
}));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/lib/env', () => ({ env: {} }));
jest.mock('@/lib/recipe-search', () => ({
  ...jest.requireActual('@/lib/recipe-search'),
  isSearchConfigured: jest.fn(),
  searchRecipes: jest.fn(),
}));
jest.mock('@/lib/recipes-db', () => ({ findSavedSlugsBySourceUrl: jest.fn() }));

import * as appHandler from '@/app/api/discover/search/route';

const mockSession = getServerSession as jest.Mock;
const mockRateLimit = rateLimit as jest.Mock;
const mockConfigured = isSearchConfigured as jest.Mock;
const mockSearch = searchRecipes as jest.Mock;
const mockSaved = findSavedSlugsBySourceUrl as jest.Mock;

const results = [
  {
    title: 'Tikka',
    url: 'https://a.example/tikka',
    site: 'A',
    snippet: '',
    thumbnail: null,
  },
  {
    title: 'Masala',
    url: 'https://b.example/masala',
    site: 'B',
    snippet: '',
    thumbnail: null,
  },
];

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockSession.mockResolvedValue({ user: { id: 'u1' } });
  mockRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
  mockConfigured.mockReturnValue(true);
  mockSearch.mockResolvedValue({ results, hasMore: true });
  mockSaved.mockResolvedValue(new Map());
});

async function get(query: string) {
  let result: { status: number; json: Record<string, unknown>; headers: Headers } | undefined;
  await testApiHandler({
    appHandler,
    url: `/api/discover/search${query}`,
    test: async ({ fetch }) => {
      const res = await fetch({ method: 'GET' });
      result = { status: res.status, json: await res.json(), headers: res.headers };
    },
  });
  return result!;
}

describe('GET /api/discover/search', () => {
  it('returns 401 when signed out', async () => {
    mockSession.mockResolvedValue(null);
    expect((await get('?q=tikka')).status).toBe(401);
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it.each(['', '?q=', '?q=%20%20'])('returns 400 without a query (%s)', async query => {
    expect((await get(query)).status).toBe(400);
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it.each(['-1', '10', 'abc', '1.5'])('returns 400 for page=%s', async page => {
    expect((await get(`?q=tikka&page=${page}`)).status).toBe(400);
  });

  it('returns 400 for an overlong query', async () => {
    expect((await get(`?q=${'a'.repeat(201)}`)).status).toBe(400);
  });

  it('returns 503 when no API key is configured, without spending rate limit', async () => {
    mockConfigured.mockReturnValue(false);
    const res = await get('?q=tikka');
    expect(res.status).toBe(503);
    expect(res.json.code).toBe('not_configured');
    expect(mockRateLimit).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited, per user', async () => {
    mockRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 120 });
    const res = await get('?q=tikka');
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('120');
    expect(mockRateLimit).toHaveBeenCalledWith('search:u1', expect.anything());
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it.each([
    ['upstream', 502],
    ['bad_response', 502],
    ['timeout', 504],
  ] as const)('maps provider failure %s to %i', async (code, status) => {
    mockSearch.mockRejectedValue(new RecipeSearchError(code));
    const res = await get('?q=tikka');
    expect(res.status).toBe(status);
    expect(res.json.code).toBe(code);
    expect(typeof res.json.error).toBe('string');
  });

  it('answers 500 without internal details on unexpected errors', async () => {
    mockSearch.mockRejectedValue(new Error('secret-key-in-message'));
    const res = await get('?q=tikka');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.json)).not.toContain('secret-key');
  });

  it('passes the trimmed query and page through', async () => {
    await get('?q=%20tikka%20&page=3');
    expect(mockSearch).toHaveBeenCalledWith('tikka', 3);
  });

  it('marks results the user already saved', async () => {
    mockSaved.mockResolvedValue(new Map([['https://b.example/masala', 'masala']]));
    const res = await get('?q=tikka');
    expect(res.status).toBe(200);
    expect(mockSaved).toHaveBeenCalledWith('u1', [
      'https://a.example/tikka',
      'https://b.example/masala',
    ]);
    expect(res.json).toEqual({
      results: [
        { ...results[0], savedSlug: null },
        { ...results[1], savedSlug: 'masala' },
      ],
      page: 0,
      hasMore: true,
    });
  });

  it('still returns results when the saved lookup fails', async () => {
    mockSaved.mockRejectedValue(new Error('db down'));
    const res = await get('?q=tikka');
    expect(res.status).toBe(200);
    expect((res.json.results as unknown[]).length).toBe(2);
  });
});
