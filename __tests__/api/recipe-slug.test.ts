/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler'; // Must be first import
import * as appHandler from '@/app/api/recipes/[slug]/route';
import { getServerSession } from 'next-auth/next';
import { getRecipeBySlug, updateRecipe, deleteRecipe } from '@/lib/recipes-db';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth-config', () => ({ authOptions: {} }));
jest.mock('@/lib/recipes-db', () => ({
  getRecipeBySlug: jest.fn(),
  updateRecipe: jest.fn(),
  deleteRecipe: jest.fn(),
}));

const mockSession = getServerSession as jest.Mock;
const mockGet = getRecipeBySlug as jest.Mock;
const mockUpdate = updateRecipe as jest.Mock;
const mockDelete = deleteRecipe as jest.Mock;

beforeEach(() => jest.resetAllMocks());

const params = { slug: 'my-recipe' };

describe('GET /api/recipes/[slug]', () => {
  it("passes the viewer's id so owners can see their private recipes", async () => {
    mockSession.mockResolvedValue({ user: { id: 'owner' } });
    mockGet.mockResolvedValue({ slug: 'my-recipe', visibility: 'private' });
    await testApiHandler({
      appHandler,
      params,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
      },
    });
    expect(mockGet).toHaveBeenCalledWith('my-recipe', 'owner');
  });

  it('returns 404 when the recipe is not visible', async () => {
    mockSession.mockResolvedValue(null);
    mockGet.mockResolvedValue(null);
    await testApiHandler({
      appHandler,
      params,
      test: async ({ fetch }) => {
        expect((await fetch({ method: 'GET' })).status).toBe(404);
      },
    });
    expect(mockGet).toHaveBeenCalledWith('my-recipe', undefined);
  });
});

describe('PUT /api/recipes/[slug]', () => {
  const put = (body: unknown) => ({
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  it('returns 401 when signed out', async () => {
    mockSession.mockResolvedValue(null);
    await testApiHandler({
      appHandler,
      params,
      test: async ({ fetch }) => {
        expect((await fetch(put({ title: 'x' }))).status).toBe(401);
      },
    });
  });

  it('returns 404 (not 500) when the user does not own the recipe', async () => {
    mockSession.mockResolvedValue({ user: { id: 'intruder' } });
    mockUpdate.mockResolvedValue(null);
    await testApiHandler({
      appHandler,
      params,
      test: async ({ fetch }) => {
        expect((await fetch(put({ title: 'x' }))).status).toBe(404);
      },
    });
  });

  it.each([
    [{ title: '   ' }],
    [{ visibility: 'secret' }],
    [{ instructions: 'not-an-array' }],
    [{ image: 42 }],
    [{ sourceUrl: 'javascript:alert(1)' }],
    [{ sourceUrl: '/relative/path' }],
    [{ sourceUrl: `https://example.com/${'a'.repeat(2048)}` }],
  ])('rejects invalid input %j with 400', async body => {
    mockSession.mockResolvedValue({ user: { id: 'u1' } });
    await testApiHandler({
      appHandler,
      params,
      test: async ({ fetch }) => {
        expect((await fetch(put(body))).status).toBe(400);
      },
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('passes null through so optional fields can be cleared', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1' } });
    mockUpdate.mockResolvedValue({ slug: 'my-recipe' });
    await testApiHandler({
      appHandler,
      params,
      test: async ({ fetch }) => {
        expect((await fetch(put({ image: null, yield: null }))).status).toBe(200);
      },
    });
    expect(mockUpdate).toHaveBeenCalledWith('my-recipe', { image: null, yield: null }, 'u1');
  });
});

describe('PUT /api/recipes/[slug] sourceUrl', () => {
  const put = (body: unknown) => ({
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  it.each([
    [{ sourceUrl: 'https://example.com/r' }, { sourceUrl: 'https://example.com/r' }],
    [{ sourceUrl: null }, { sourceUrl: null }],
    [{ sourceUrl: '' }, { sourceUrl: null }],
    [{ title: 'Only title' }, { title: 'Only title' }],
  ])('passes %j to the data layer as %j', async (body, expected) => {
    mockSession.mockResolvedValue({ user: { id: 'u1' } });
    mockUpdate.mockResolvedValue({ slug: 'my-recipe' });
    await testApiHandler({
      appHandler,
      params,
      test: async ({ fetch }) => {
        expect((await fetch(put(body))).status).toBe(200);
      },
    });
    expect(mockUpdate).toHaveBeenCalledWith('my-recipe', expected, 'u1');
  });
});

describe('DELETE /api/recipes/[slug]', () => {
  it('returns 404 (not 500) when the user does not own the recipe', async () => {
    mockSession.mockResolvedValue({ user: { id: 'intruder' } });
    mockDelete.mockResolvedValue(false);
    await testApiHandler({
      appHandler,
      params,
      test: async ({ fetch }) => {
        expect((await fetch({ method: 'DELETE' })).status).toBe(404);
      },
    });
  });
});
