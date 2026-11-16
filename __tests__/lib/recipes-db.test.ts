/**
 * @jest-environment node
 */
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  createRecipe,
  deleteRecipe,
  getAllRecipes,
  getRecipeBySlug,
  updateRecipe,
} from '@/lib/recipes-db';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    recipe: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const recipe = prisma.recipe as unknown as Record<string, jest.Mock>;

beforeEach(() => jest.resetAllMocks());

describe('author fields', () => {
  it('never selects author email', async () => {
    recipe.findMany.mockResolvedValue([]);
    await getAllRecipes();
    expect(recipe.findMany.mock.calls[0][0].include).toEqual({
      author: { select: { id: true, name: true } },
    });
  });
});

describe('getRecipeBySlug', () => {
  const priv = { slug: 's', visibility: 'private', authorId: 'owner' };

  it('hides private recipes from other users', async () => {
    recipe.findUnique.mockResolvedValue(priv);
    expect(await getRecipeBySlug('s')).toBeNull();
    expect(await getRecipeBySlug('s', 'someone-else')).toBeNull();
  });

  it('shows private recipes to their owner', async () => {
    recipe.findUnique.mockResolvedValue(priv);
    expect(await getRecipeBySlug('s', 'owner')).toEqual(priv);
  });
});

describe('database errors', () => {
  // An outage must not look like "no recipes" or "not found".
  it('propagate from getAllRecipes', async () => {
    recipe.findMany.mockRejectedValue(new Error('db down'));
    await expect(getAllRecipes()).rejects.toThrow('db down');
  });

  it('propagate from getRecipeBySlug', async () => {
    recipe.findUnique.mockRejectedValue(new Error('db down'));
    await expect(getRecipeBySlug('s')).rejects.toThrow('db down');
  });
});

describe('updateRecipe', () => {
  it('returns null (not throw) when the recipe does not exist', async () => {
    recipe.findUnique.mockResolvedValue(null);
    await expect(updateRecipe('missing', { title: 'x' }, 'u1')).resolves.toBeNull();
    expect(recipe.update).not.toHaveBeenCalled();
  });

  it('returns null (not throw) when the user is not the owner', async () => {
    recipe.findUnique.mockResolvedValue({ slug: 's', authorId: 'owner' });
    await expect(updateRecipe('s', { title: 'x' }, 'intruder')).resolves.toBeNull();
    expect(recipe.update).not.toHaveBeenCalled();
  });

  it('writes only the fields it was given', async () => {
    recipe.findUnique.mockResolvedValue({ slug: 's', authorId: 'u1' });
    recipe.update.mockResolvedValue({});
    await updateRecipe('s', { image: null, description: '' }, 'u1');
    expect(recipe.update.mock.calls[0][0].data).toEqual({ image: null, description: '' });
  });

  it('sets and clears sourceUrl, and leaves it alone when omitted', async () => {
    recipe.findUnique.mockResolvedValue({ slug: 's', authorId: 'u1' });
    recipe.update.mockResolvedValue({});
    await updateRecipe('s', { sourceUrl: 'https://example.com/r' }, 'u1');
    await updateRecipe('s', { sourceUrl: null }, 'u1');
    await updateRecipe('s', { title: 'x' }, 'u1');
    expect(recipe.update.mock.calls.map(c => c[0].data)).toEqual([
      { sourceUrl: 'https://example.com/r' },
      { sourceUrl: null },
      { title: 'x' },
    ]);
  });
});

describe('deleteRecipe', () => {
  it('only deletes recipes owned by the user', async () => {
    recipe.deleteMany.mockResolvedValue({ count: 0 });
    await expect(deleteRecipe('s', 'intruder')).resolves.toBe(false);
    expect(recipe.deleteMany).toHaveBeenCalledWith({ where: { slug: 's', authorId: 'intruder' } });
  });

  it('returns true when a recipe was deleted', async () => {
    recipe.deleteMany.mockResolvedValue({ count: 1 });
    await expect(deleteRecipe('s', 'u1')).resolves.toBe(true);
  });
});

describe('createRecipe', () => {
  const base = {
    title: 'Pancakes',
    description: '',
    ingredients: [{ amount: 1, unit: 'cup', name: 'flour' }],
    instructions: ['Mix'],
    tags: [],
    visibility: 'public' as const,
  };

  it('suffixes the slug when it is already taken', async () => {
    recipe.findMany.mockResolvedValue([{ slug: 'pancakes' }, { slug: 'pancakes-2' }]);
    recipe.create.mockImplementation(({ data }) => Promise.resolve(data));
    const created = await createRecipe(base, 'u1');
    expect(created.slug).toBe('pancakes-3');
  });

  it('falls back to "recipe" when the title has no slug-safe characters', async () => {
    recipe.findMany.mockResolvedValue([]);
    recipe.create.mockImplementation(({ data }) => Promise.resolve(data));
    const created = await createRecipe({ ...base, title: '!!!' }, 'u1');
    expect(created.slug).toBe('recipe');
  });

  const uniqueViolation = (field: string) =>
    new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: [field] },
    });

  it('retries with a fresh slug when a concurrent create takes it first', async () => {
    recipe.findMany
      .mockResolvedValueOnce([]) // first check: "pancakes" looks free
      .mockResolvedValueOnce([{ slug: 'pancakes' }]); // after losing the race
    recipe.create
      .mockRejectedValueOnce(uniqueViolation('slug'))
      .mockImplementation(({ data }) => Promise.resolve(data));
    const created = await createRecipe(base, 'u1');
    expect(created.slug).toBe('pancakes-2');
    expect(recipe.create).toHaveBeenCalledTimes(2);
  });

  it('gives up after repeated slug collisions', async () => {
    recipe.findMany.mockResolvedValue([]);
    recipe.create.mockRejectedValue(uniqueViolation('slug'));
    await expect(createRecipe(base, 'u1')).rejects.toBeInstanceOf(
      Prisma.PrismaClientKnownRequestError
    );
    expect(recipe.create).toHaveBeenCalledTimes(5);
  });

  it('stores sourceUrl', async () => {
    recipe.findMany.mockResolvedValue([]);
    recipe.create.mockImplementation(({ data }) => Promise.resolve(data));
    const created = await createRecipe({ ...base, sourceUrl: 'https://example.com/p' }, 'u1');
    expect(created.sourceUrl).toBe('https://example.com/p');
  });

  it('does not retry other errors', async () => {
    recipe.findMany.mockResolvedValue([]);
    recipe.create.mockRejectedValue(new Error('db down'));
    await expect(createRecipe(base, 'u1')).rejects.toThrow('db down');
    expect(recipe.create).toHaveBeenCalledTimes(1);
  });

});
