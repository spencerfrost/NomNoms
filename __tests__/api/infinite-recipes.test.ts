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
  },
}));

import * as appHandler from '@/app/api/recipes/infinite/route';
import { prisma } from '@/lib/prisma';

// Get the mocked function for use in tests
const mockFindMany = prisma.recipe.findMany as jest.MockedFunction<typeof prisma.recipe.findMany>;

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
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
  lastEdited: Date | null;
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
        visibility: 'public',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastEdited: null,
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
        visibility: 'public',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        lastEdited: null,
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
        expect(data.recipes).toEqual(mockRecipes);
        expect(data.hasMore).toBe(false);
        expect(data.nextCursor).toBeNull();
      },
    });
  });

  it('should handle search parameters', async () => {
    const mockRecipes: MockRecipe[] = [];
    mockFindMany.mockResolvedValue(mockRecipes);

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
              {
                OR: [
                  { title: { contains: 'pasta', mode: 'insensitive' } },
                  { description: { contains: 'pasta', mode: 'insensitive' } },
                ],
              },
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
      visibility: 'public',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEdited: null,
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
