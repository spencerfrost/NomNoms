import { promises as fs } from 'fs';
import path from 'path';
import { Recipe, Ingredient } from './types';

// Re-export types for convenience
export type { Recipe, Ingredient } from './types';

const RECIPES_DIR = path.join(process.cwd(), 'data', 'recipes');

// Ensure this only runs on server-side
function ensureServerSide() {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called on the server side');
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  ensureServerSide();
  try {
    const files = await fs.readdir(RECIPES_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const recipes = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(RECIPES_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content) as Recipe;
      })
    );
    
    return recipes.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error('Error reading recipes:', error);
    return [];
  }
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  ensureServerSide();
  try {
    const filePath = path.join(RECIPES_DIR, `${slug}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as Recipe;
  } catch (error) {
    console.error(`Error reading recipe ${slug}:`, error);
    return null;
  }
}

export function scaleRecipe(recipe: Recipe, multiplier: number): Recipe {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map(ingredient => ({
      ...ingredient,
      amount: Math.round((ingredient.amount * multiplier) * 100) / 100 // Round to 2 decimal places
    }))
  };
}

export function scaleIngredients(ingredients: Ingredient[], multiplier: number): Ingredient[] {
  return ingredients.map(ingredient => ({
    ...ingredient,
    amount: Math.round((ingredient.amount * multiplier) * 100) / 100 // Round to 2 decimal places
  }))
}

export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query.trim()) return recipes;
  
  const lowerQuery = query.toLowerCase();
  return recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(lowerQuery) ||
    recipe.description.toLowerCase().includes(lowerQuery) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(lowerQuery))
  );
}

export async function saveRecipe(recipe: Recipe): Promise<string> {
  ensureServerSide();
  // Generate slug from title if not provided
  const slug = recipe.slug || recipe.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const recipeWithSlug = { ...recipe, slug };
  const filePath = path.join(RECIPES_DIR, `${slug}.json`);
  
  await fs.writeFile(filePath, JSON.stringify(recipeWithSlug, null, 2));
  return slug;
}

export function formatAmount(amount: number, unit: string): string {
  // Handle fractions for common cooking measurements
  if (amount === 0.25) return `¼ ${unit}`;
  if (amount === 0.33) return `⅓ ${unit}`;
  if (amount === 0.5) return `½ ${unit}`;
  if (amount === 0.67) return `⅔ ${unit}`;
  if (amount === 0.75) return `¾ ${unit}`;
  
  // For whole numbers, don't show decimal
  if (amount % 1 === 0) {
    return `${amount} ${unit}`;
  }
  
  // For other decimals, show up to 2 decimal places
  return `${amount} ${unit}`;
}
