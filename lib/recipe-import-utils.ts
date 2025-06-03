/**
 * Utilities for importing recipes from URLs using recipe-scraper
 */

import { Ingredient } from '@/types/recipe';
import { parseAmountToDecimal } from './amount-utils';

export interface ScrapedRecipe {
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  servings?: string;
  time?: {
    prep?: string;
    cook?: string;
    total?: string;
  };
  image?: string;
  tags?: string[];
  url?: string;
}

export interface ImportedRecipe {
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  imageUrl: string | null;
  tags: string[];
  sourceUrl: string;
  isPublic: boolean;
}

/**
 * Parse a time string like "15 mins", "1 hour 30 minutes", "45 min" into minutes
 */
export function parseTimeString(timeText: string | undefined | null): number {
  if (!timeText) return 0;
  
  const text = timeText.toLowerCase().trim();
  if (!text || text === '0') return 0;
  
  let totalMinutes = 0;
  
  // Extract hours
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)/);
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60;
  }
  
  // Extract minutes
  const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min\b|m\b)/);
  if (minuteMatch) {
    totalMinutes += parseFloat(minuteMatch[1]);
  }
  
  // If no specific units found, assume it's minutes
  if (totalMinutes === 0) {
    const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      totalMinutes = parseFloat(numberMatch[1]);
    }
  }
  
  return Math.round(totalMinutes);
}

/**
 * Parse an ingredient string like "1 cup flour" into structured ingredient
 */
export function parseIngredientString(ingredientText: string): Ingredient {
  if (!ingredientText?.trim()) {
    return { amount: 0, unit: '', name: '' };
  }
  
  const text = ingredientText.trim();
  
  // Common patterns for ingredient parsing
  // Pattern 1: "1 cup flour" or "1/2 cup flour" or "1.5 cups flour"
  const amountUnitPattern = /^([0-9]+(?:\s*[0-9]*\/[0-9]+)?(?:\.[0-9]+)?)\s+([a-zA-Z]+s?)\s+(.+)$/;
  const match = amountUnitPattern.exec(text);
  
  if (match) {
    const amountStr = match[1].trim();
    const unit = match[2].trim();
    const name = match[3].trim();
    
    const amount = parseAmountToDecimal(amountStr);
    return { amount, unit, name };
  }
  
  // Pattern 2: Just amount and ingredient (no unit): "2 eggs", "3 carrots"
  const amountOnlyPattern = /^([0-9]+(?:\s*[0-9]*\/[0-9]+)?(?:\.[0-9]+)?)\s+(.+)$/;
  const amountMatch = amountOnlyPattern.exec(text);
  
  if (amountMatch) {
    const amountStr = amountMatch[1].trim();
    const name = amountMatch[2].trim();
    
    const amount = parseAmountToDecimal(amountStr);
    return { amount, unit: '', name };
  }
  
  // Pattern 3: No amount found, treat entire text as ingredient name
  return { amount: 0, unit: '', name: text };
}

/**
 * Parse servings string like "4", "4-6", "4 servings" into a number
 */
export function parseServingsString(servingsText: string | undefined | null): number {
  if (!servingsText) return 1;
  
  const text = servingsText.toLowerCase().trim();
  if (!text) return 1;
  
  // Extract first number from patterns like "4", "4-6", "4 servings", "serves 4"
  const match = text.match(/(\d+)/);
  if (match) {
    const servings = parseInt(match[1]);
    return servings > 0 ? servings : 1;
  }
  
  return 1;
}

/**
 * Transform scraped recipe data into NomNoms format
 */
export function transformScrapedRecipe(scraped: ScrapedRecipe, sourceUrl: string): ImportedRecipe {
  const ingredients = scraped.ingredients?.map(parseIngredientString) || [];
  const instructions = Array.isArray(scraped.instructions) 
    ? scraped.instructions.filter(Boolean) 
    : typeof scraped.instructions === 'string' 
      ? [scraped.instructions] 
      : [];
  
  return {
    name: scraped.name || 'Imported Recipe',
    description: scraped.description || '',
    ingredients,
    instructions,
    servings: parseServingsString(scraped.servings),
    prepTimeMinutes: parseTimeString(scraped.time?.prep),
    cookTimeMinutes: parseTimeString(scraped.time?.cook),
    imageUrl: scraped.image || null,
    tags: Array.isArray(scraped.tags) ? scraped.tags.filter(Boolean) : [],
    sourceUrl,
    isPublic: false, // Default to private
  };
}

/**
 * Validate if a URL looks like a recipe URL
 */
export function isValidRecipeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check if it's http/https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Basic domain validation - must have at least one dot
    if (!urlObj.hostname.includes('.')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user-friendly error messages for import failures
 */
export function getImportErrorMessage(error: unknown): string {
  const errorStr = error instanceof Error ? error.message : String(error);
  
  if (errorStr.includes('timeout') || errorStr.includes('TIMEOUT')) {
    return 'The website took too long to respond. Please try again or add the recipe manually.';
  }
  
  if (errorStr.includes('404') || errorStr.includes('not found')) {
    return 'The recipe page was not found. Please check the URL and try again.';
  }
  
  if (errorStr.includes('network') || errorStr.includes('NETWORK')) {
    return 'Network error occurred. Please check your connection and try again.';
  }
  
  if (errorStr.includes('unsupported') || errorStr.includes('UNSUPPORTED')) {
    return 'This website is not supported yet. Try a URL from AllRecipes, Food Network, or other popular recipe sites.';
  }
  
  if (errorStr.includes('no recipe')) {
    return 'No recipe was found at this URL. Please check the link and try again.';
  }
  
  return 'Unable to import recipe. Please try again or add the recipe manually.';
}
