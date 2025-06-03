import { Recipe, Ingredient, getRecipeIngredients } from './types';
import { parseAmountToDecimal, formatDecimalAsFraction, scaleAndFormatAmount } from './amount-utils';

// Client-safe utility functions for recipes

export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query.trim()) return recipes;
  
  const lowerQuery = query.toLowerCase();
  return recipes.filter(recipe => {
    const ingredients = getRecipeIngredients(recipe);
    return (
      recipe.title.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      ingredients.some(ingredient => ingredient.name.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Scale a recipe by a multiplier
 */
export function scaleRecipe(recipe: Recipe, multiplier: number): Recipe {
  const ingredients = getRecipeIngredients(recipe);
  return {
    ...recipe,
    ingredients: ingredients.map(ingredient => ({
      ...ingredient,
      amount: parseAmountToDecimal(ingredient.amount) * multiplier
    }))
  };
}

/**
 * Scale ingredients by a multiplier  
 */
export function scaleIngredients(ingredients: Ingredient[], multiplier: number): Ingredient[] {
  return ingredients.map(ingredient => ({
    ...ingredient,
    amount: parseAmountToDecimal(ingredient.amount) * multiplier
  }));
}

/**
 * Format an ingredient amount for display
 */
export function formatIngredientAmount(amount: string | number): string {
  const decimal = parseAmountToDecimal(amount);
  return formatDecimalAsFraction(decimal);
}

/**
 * Scale and format an ingredient amount for display
 */
export function scaleAndFormatIngredientAmount(amount: string | number, multiplier: number): string {
  return scaleAndFormatAmount(amount, multiplier);
}


