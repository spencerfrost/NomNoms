/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler'; // Must be first import
import * as appHandler from '@/app/api/recipes/route';
import { getServerSession } from 'next-auth/next';
import { createRecipe } from '@/lib/recipes-db';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth-config', () => ({ authOptions: {} }));
jest.mock('@/lib/recipes-db', () => ({
  getAllRecipes: jest.fn(),
  createRecipe: jest.fn(),
}));

const mockSession = getServerSession as jest.Mock;
const mockCreate = createRecipe as jest.Mock;

beforeEach(() => jest.resetAllMocks());

const post = (body: unknown) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

const valid = {
  title: 'Pancakes',
  description: 'Fluffy',
  ingredients: [{ amount: 2, unit: 'cups', name: 'flour' }],
  instructions: ['Mix', 'Cook'],
  tags: ['breakfast'],
};

describe('POST /api/recipes', () => {
  it('returns 401 when signed out', async () => {
    mockSession.mockResolvedValue(null);
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        expect((await fetch(post(valid))).status).toBe(401);
      },
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates the recipe from validated input and returns the slug', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1' } });
    mockCreate.mockResolvedValue({ slug: 'pancakes' });
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const res = await fetch(post({ ...valid, authorId: 'someone-else' }));
        expect(res.status).toBe(201);
        expect(await res.json()).toMatchObject({ slug: 'pancakes' });
      },
    });
    expect(mockCreate).toHaveBeenCalledWith({ ...valid, visibility: 'public' }, 'u1');
  });

  it('returns 400 with the validation message for bad input', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1' } });
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const res = await fetch(post({ ...valid, ingredients: [{ amount: 1, name: 'x' }] }));
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'Ingredient 1: unit must be a string' });
      },
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('accepts an http(s) sourceUrl', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1' } });
    mockCreate.mockResolvedValue({ slug: 'pancakes' });
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const res = await fetch(post({ ...valid, sourceUrl: ' https://example.com/p ' }));
        expect(res.status).toBe(201);
      },
    });
    expect(mockCreate.mock.calls[0][0].sourceUrl).toBe('https://example.com/p');
  });

  it.each(['javascript:alert(1)', 'example.com/p', 'ftp://example.com/p'])(
    'rejects sourceUrl %s with 400',
    async sourceUrl => {
      mockSession.mockResolvedValue({ user: { id: 'u1' } });
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const res = await fetch(post({ ...valid, sourceUrl }));
          expect(res.status).toBe(400);
          expect(await res.json()).toEqual({ error: 'Source URL must be an http(s) URL' });
        },
      });
      expect(mockCreate).not.toHaveBeenCalled();
    }
  );

  it('returns 400 for malformed JSON', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1' } });
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        expect((await fetch(post('{not json'))).status).toBe(400);
      },
    });
  });
});
