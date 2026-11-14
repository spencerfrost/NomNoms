// Server-side recipe data layer. Inputs are already validated and normalized by
// lib/recipe-schema.ts; this module owns visibility and ownership rules.
import { prisma } from './prisma';
import { Recipe } from '@/types';
import { Prisma } from '@prisma/client';
import { isUniqueViolation } from './prisma-errors';
import type { RecipeCreateInput, RecipeUpdateInput } from './recipe-schema';

// Re-export types for convenience
export type { Recipe, Ingredient } from '@/types';

// Public author fields only. Never select email here: these results are served
// to unauthenticated users.
const authorInclude = {
  author: { select: { id: true, name: true } },
} satisfies Prisma.RecipeInclude;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || 'recipe';
  const taken = await prisma.recipe.findMany({
    where: { slug: { startsWith: root } },
    select: { slug: true },
  });
  const takenSet = new Set(taken.map(r => r.slug));
  if (!takenSet.has(root)) return root;
  let n = 2;
  while (takenSet.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

// Read functions let database errors propagate so routes can answer 500, rather than
// reporting an outage as "no recipes" or "not found".

export async function getAllRecipes(userId?: string): Promise<Recipe[]> {
  return prisma.recipe.findMany({
    where: {
      // Show public recipes and user's own recipes if userId provided
      OR: [{ visibility: 'public' }, ...(userId ? [{ authorId: userId }] : [])],
    },
    include: authorInclude,
    orderBy: { title: 'asc' },
  });
}

/** Returns null when the recipe doesn't exist or is private and not owned by `userId`. */
export async function getRecipeBySlug(slug: string, userId?: string): Promise<Recipe | null> {
  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: authorInclude,
  });

  if (!recipe) {
    return null;
  }

  // Check visibility permissions
  if (recipe.visibility === 'private' && recipe.authorId !== userId) {
    return null;
  }

  return recipe;
}

const MAX_SLUG_ATTEMPTS = 5;

export async function createRecipe(
  recipeData: RecipeCreateInput,
  authorId: string
): Promise<Recipe> {
  const base = slugify(recipeData.title);

  // uniqueSlug() is check-then-insert, so two concurrent creates can pick the same slug.
  // The unique index catches that; recompute and retry instead of failing the request.
  for (let attempt = 1; ; attempt++) {
    const slug = await uniqueSlug(base);
    try {
      return await prisma.recipe.create({
        data: { ...recipeData, slug, authorId },
        include: authorInclude,
      });
    } catch (error) {
      if (attempt < MAX_SLUG_ATTEMPTS && isUniqueViolation(error, 'slug')) continue;
      throw error;
    }
  }
}

/**
 * Update a recipe owned by `userId`. Fields that are undefined are left alone; null
 * clears an optional field. The slug never changes.
 * Returns null when the recipe doesn't exist or isn't owned by the user, so callers
 * can respond 404 without revealing which.
 */
export async function updateRecipe(
  slug: string,
  recipeData: RecipeUpdateInput,
  userId: string
): Promise<Recipe | null> {
  const currentRecipe = await prisma.recipe.findUnique({ where: { slug } });
  if (!currentRecipe || currentRecipe.authorId !== userId) {
    return null;
  }

  return prisma.recipe.update({
    where: { slug },
    data: recipeData,
    include: authorInclude,
  });
}

/**
 * Delete a recipe owned by `userId`. Returns false when it doesn't exist or isn't owned.
 */
export async function deleteRecipe(slug: string, userId: string): Promise<boolean> {
  const { count } = await prisma.recipe.deleteMany({ where: { slug, authorId: userId } });
  return count > 0;
}
