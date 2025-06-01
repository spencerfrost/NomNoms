import { Recipe, Ingredient } from './types';

// Client-safe utility functions for recipes

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
  }));
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
