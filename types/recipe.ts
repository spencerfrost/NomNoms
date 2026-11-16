import { Recipe as PrismaRecipe } from '@prisma/client';

export interface Ingredient {
  /** Decimal, for easy scaling. 0 means "no amount" ("salt to taste"). The low end of a range. */
  amount: number;
  /** High end of a range ("2-3 Tbsp"). Only set when it's a range: always > `amount` > 0. */
  amountMax?: number;
  unit: string;
  name: string;
}

// Use Prisma types as the base, but add the author relation type
export type Recipe = PrismaRecipe & {
  author?: {
    id: string;
    name: string | null;
  };
};

// Type guard to check if a JsonValue is an array of ingredients
export function isIngredientArray(value: unknown): value is Ingredient[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        typeof item === 'object' &&
        item !== null &&
        'amount' in item &&
        'unit' in item &&
        'name' in item &&
        typeof item.amount === 'number' &&
        (!('amountMax' in item) || item.amountMax === undefined || typeof item.amountMax === 'number') &&
        typeof item.unit === 'string' &&
        typeof item.name === 'string'
    )
  );
}

// Helper to safely get ingredients from a recipe
export function getRecipeIngredients(recipe: PrismaRecipe): Ingredient[] {
  if (!recipe.ingredients) return [];
  if (isIngredientArray(recipe.ingredients)) {
    return recipe.ingredients;
  }
  return [];
}
