import { Recipe as PrismaRecipe, User as PrismaUser } from '@prisma/client'

export interface Ingredient {
  amount: number; // Always store as decimal number for easy scaling
  unit: string;
  name: string;
}

// Use Prisma types as the base, but add the author relation type
export type Recipe = PrismaRecipe & {
  author?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Use Prisma User type directly - it has name as nullable which matches the schema
export type User = PrismaUser

// Type guard to check if a JsonValue is an array of ingredients
export function isIngredientArray(value: unknown): value is Ingredient[] {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && 
    item !== null &&
    'amount' in item &&
    'unit' in item &&
    'name' in item &&
    typeof item.amount === 'number' &&
    typeof item.unit === 'string' &&
    typeof item.name === 'string'
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