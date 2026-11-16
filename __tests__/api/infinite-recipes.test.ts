/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler'; // Must be first import

// Mock the prisma module before importing
jest.mock('@/lib/prisma', () => ({
  prisma: {
    recipe: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
  },
}));

import * as appHandler from '@/app/api/recipes/infinite/route';
import { prisma } from '@/lib/prisma';

// Get the mocked function for use in tests
const mockFindMany = prisma.recipe.findMany as jest.MockedFunction<typeof prisma.recipe.findMany>;
const mockQueryRaw = prisma.$queryRaw as unknown as jest.Mock;

// Flatten a tagged-template call to its SQL text and bound values.
function rawCall(call: unknown[]) {
  const [strings, ...values] = call as [TemplateStringsArray, ...unknown[]];
  return { sql: strings.join('?'), values };
}

type MockRecipe = {
  id: string;
  title: string;
  description: string;
  slug: string;
  ingredients: any;
  instructions: string[];
  tags: string[];
  yield: string | null;
  prepTime: string | null;
  cookTime: string | null;
  image: string | null;
  sourceUrl: string | null;
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: { id: string; name: string };
};

describe('/api/recipes/infinite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return recipes with pagination info', async () => {
    const mockRecipes: MockRecipe[] = [
      {
        id: '1',
        title: 'Recipe 1',
        description: 'Description 1',
        slug: 'recipe-1',
        ingredients: [],
        instructions: ['Step 1'],
        tags: ['tag1'],
        yield: '4 servings',
        prepTime: '10 min',
        cookTime: '20 min',
        image: null,
        sourceUrl: null,
        visibility: 'public',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        authorId: 'user1',
        author: { id: 'user1', name: 'Chef 1' },
      },
      {
        id: '2',
        title: 'Recipe 2',
        description: 'Description 2',
        slug: 'recipe-2',
        ingredients: [],
        instructions: ['Step 1'],
        tags: ['tag2'],
        yield: '2 servings',
        prepTime: '5 min',
        cookTime: '15 min',
        image: null,
        sourceUrl: null,
        visibility: 'public',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        authorId: 'user2',
        author: { id: 'user2', name: 'Chef 2' },
      },
    ];

    mockFindMany.mockResolvedValue(mockRecipes);

    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'GET',
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        // Dates are serialized to ISO strings in the JSON response
        expect(data.recipes).toEqual(JSON.parse(JSON.stringify(mockRecipes)));
        expect(data.hasMore).toBe(false);
        expect(data.nextCursor).toBeNull();
      },
    });
  });

  it('should handle search parameters', async () => {
    mockQueryRaw.mockResolvedValue([{ id: 'match-1' }, { id: 'match-2' }]);
    mockFindMany.mockResolvedValue([]);

    await testApiHandler({
      appHandler,
      requestPatcher: request => {
        return new Request(
          'http://localhost:3000/api/recipes/infinite?search=pasta&tags=italian,dinner&limit=12'
        );
      },
      test: async ({ fetch }) => {
        await fetch({ method: 'GET' });

        expect(mockFindMany).toHaveBeenCalledWith({
          where: {
            AND: [
              { id: { in: ['match-1', 'match-2'] } },
              { tags: { hasSome: ['italian', 'dinner'] } },
              { visibility: 'public' },
            ],
          },
          take: 13, // limit + 1
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        });
      },
    });
  });

  it('searches title, description, tags and ingredient names', async () => {
    mockQueryRaw.mockResolvedValue([]);
    mockFindMany.mockResolvedValue([]);

    await testApiHandler({
      appHandler,
      requestPatcher: () => new Request('http://localhost:3000/api/recipes/infinite?search=garlic'),
      test: async ({ fetch }) => {
        await fetch({ method: 'GET' });
      },
    });

    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
    const { sql, values } = rawCall(mockQueryRaw.mock.calls[0]);
    expect(sql).toMatch(/r\.title ILIKE/);
    expect(sql).toMatch(/r\.description ILIKE/);
    expect(sql).toMatch(/unnest\(r\.tags\)/);
    expect(sql).toMatch(/jsonb_array_elements\(r\.ingredients\)/);
    expect(sql).toMatch(/visibility = 'public'/);
    expect(values.every(v => v === '%garlic%')).toBe(true);
  });

  it('escapes LIKE wildcards in the search term', async () => {
    mockQueryRaw.mockResolvedValue([]);
    mockFindMany.mockResolvedValue([]);

    await testApiHandler({
      appHandler,
      requestPatcher: () =>
        new Request(
          'http://localhost:3000/api/recipes/infinite?search=' + encodeURIComponent('50%_off')
        ),
      test: async ({ fetch }) => {
        await fetch({ method: 'GET' });
      },
    });

    const { values } = rawCall(mockQueryRaw.mock.calls[0]);
    expect(values[0]).toBe('%50\\%\\_off%');
  });

  it('skips the search query when there is no search term', async () => {
    mockFindMany.mockResolvedValue([]);

    await testApiHandler({
      appHandler,
      requestPatcher: () => new Request('http://localhost:3000/api/recipes/infinite?search=%20%20'),
      test: async ({ fetch }) => {
        await fetch({ method: 'GET' });
      },
    });

    expect(mockQueryRaw).not.toHaveBeenCalled();
    expect(mockFindMany.mock.calls[0][0]!.where).toEqual({
      AND: [{}, {}, { visibility: 'public' }],
    });
  });

  it('returns 500 when the database fails', async () => {
    mockFindMany.mockRejectedValue(new Error('connection refused'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(500);
      },
    });
  });

  it('should handle cursor pagination', async () => {
    const mockRecipes: MockRecipe[] = [];
    mockFindMany.mockResolvedValue(mockRecipes);

    await testApiHandler({
      appHandler,
      requestPatcher: request => {
        return new Request('http://localhost:3000/api/recipes/infinite?cursor=recipe123&limit=24');
      },
      test: async ({ fetch }) => {
        await fetch({ method: 'GET' });

        expect(mockFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            cursor: { id: 'recipe123' },
            skip: 1,
          })
        );
      },
    });
  });

  it('should detect when there are more results', async () => {
    // Return limit + 1 recipes to simulate hasMore = true
    const mockRecipes: MockRecipe[] = Array.from({ length: 25 }, (_, i) => ({
      id: `recipe-${i}`,
      title: `Recipe ${i}`,
      description: `Description ${i}`,
      slug: `recipe-${i}`,
      ingredients: [],
      instructions: ['Step 1'],
      tags: ['tag'],
      yield: '4 servings',
      prepTime: '10 min',
      cookTime: '20 min',
      image: null,
      sourceUrl: null,
      visibility: 'public',
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: 'user1',
      author: { id: 'user1', name: 'Chef' },
    }));

    mockFindMany.mockResolvedValue(mockRecipes);

    await testApiHandler({
      appHandler,
      requestPatcher: request => {
        return new Request('http://localhost:3000/api/recipes/infinite?limit=24');
      },
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'GET' });
        const data = await response.json();

        expect(data.recipes).toHaveLength(24); // Should return only limit amount
        expect(data.hasMore).toBe(true);
        expect(data.nextCursor).toBe('recipe-23'); // Second to last recipe ID
      },
    });
  });
});
