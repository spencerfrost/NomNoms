/**
 * Utilities for importing recipes from URLs using JSON-LD structured data
 */

import { Ingredient } from '@/types/recipe';
import { parseAmountToDecimal } from './amount-utils';
import * as cheerio from 'cheerio';

// JSON-LD Recipe schema types based on schema.org
export interface JsonLdRecipe {
  '@context'?: string | string[];
  '@type'?: string | string[];
  name?: string;
  description?: string;
  image?: string | string[] | ImageObject | ImageObject[];
  recipeIngredient?: string[];
  recipeInstructions?: (string | { text?: string; '@type'?: string })[];
  recipeYield?: string | number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  nutrition?: {
    calories?: string | number;
    servingSize?: string | number;
  };
  recipeCategory?: string | string[];
  recipeCuisine?: string | string[];
  keywords?: string | string[];
  author?: { name?: string } | string;
}

export interface ImageObject {
  '@type'?: string;
  url?: string;
  '@url'?: string;
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

  if (errorStr.includes('Could not find recipe data')) {
    return 'No recipe was found at this URL. The site might not have structured recipe data or might not be supported yet.';
  }

  if (errorStr.includes('unsupported') || errorStr.includes('UNSUPPORTED')) {
    return 'This website is not supported yet. Try a URL from AllRecipes, Food Network, or other popular recipe sites that use structured data.';
  }

  if (errorStr.includes('no recipe')) {
    return 'No recipe was found at this URL. Please check the link and try again.';
  }

  return 'Unable to import recipe. Please try again or add the recipe manually.';
}

/**
 * Parse ISO 8601 duration (like PT15M for 15 minutes) or human-readable time into minutes
 */
export function parseTimeToMinutes(timeText: string | undefined | null): number {
  if (!timeText) return 0;

  const text = timeText.trim();
  if (!text || text === '0') return 0;

  // Handle ISO 8601 duration format (PT15M, PT1H30M, etc.)
  if (text.startsWith('PT')) {
    let totalMinutes = 0;

    // Extract hours (H)
    const hourMatch = text.match(/(\d+)H/);
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }

    // Extract minutes (M)
    const minuteMatch = text.match(/(\d+)M/);
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
    }

    return totalMinutes;
  }

  // Handle human-readable format
  return parseTimeString(text);
}

/**
 * Extract all JSON-LD scripts from HTML and find recipe data
 */
export function extractRecipeFromHtml(htmlContent: string): JsonLdRecipe | null {
  const $ = cheerio.load(htmlContent);

  // Find all JSON-LD script tags
  const jsonLdScripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const scriptContent = $(jsonLdScripts[i]).html();
      if (!scriptContent) continue;

      const jsonData = JSON.parse(scriptContent);

      // Handle both single objects and arrays
      const items = Array.isArray(jsonData) ? jsonData : [jsonData];

      for (const item of items) {
        // Look for Recipe type (can be nested in @graph)
        if (
          item['@type'] === 'Recipe' ||
          (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
        ) {
          return item as JsonLdRecipe;
        }

        // Check if it's a nested structure with @graph
        if (item['@graph']) {
          for (const graphItem of item['@graph']) {
            if (
              graphItem['@type'] === 'Recipe' ||
              (Array.isArray(graphItem['@type']) && graphItem['@type'].includes('Recipe'))
            ) {
              return graphItem as JsonLdRecipe;
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse JSON-LD script:', error);
      continue;
    }
  }

  return null;
}

/**
 * Transform JSON-LD recipe data into our format
 */
export function transformJsonLdRecipe(jsonLd: JsonLdRecipe, sourceUrl: string): ImportedRecipe {
  // Parse ingredients
  const ingredients: Ingredient[] = (jsonLd.recipeIngredient || []).map(parseIngredientString);

  // Parse instructions
  const instructions: string[] = (jsonLd.recipeInstructions || [])
    .map(instruction => {
      if (typeof instruction === 'string') {
        return instruction;
      }
      if (typeof instruction === 'object' && instruction.text) {
        return instruction.text;
      }
      return '';
    })
    .filter(Boolean);

  // Get image URL with enhanced debugging
  let imageUrl: string | null = null;
  console.info('Processing image data:', jsonLd.image);

  if (jsonLd.image) {
    if (typeof jsonLd.image === 'string') {
      imageUrl = jsonLd.image;
      console.info('Found string image:', imageUrl);
    } else if (Array.isArray(jsonLd.image)) {
      // Take the first image
      const firstImage = jsonLd.image[0];
      console.info('Processing array image, first item:', firstImage);
      if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      } else if (firstImage && typeof firstImage === 'object') {
        // Handle both { url: "..." } and { "@type": "ImageObject", url: "..." }
        const imgObj = firstImage as ImageObject;
        imageUrl = imgObj.url || imgObj['@url'] || null;
        console.info('Extracted from object:', imageUrl);
      }
    } else if (typeof jsonLd.image === 'object') {
      // Handle single image object
      const imgObj = jsonLd.image as ImageObject;
      imageUrl = imgObj.url || imgObj['@url'] || null;
      console.info('Single image object:', imageUrl);
    }
  }

  // Ensure image URL is absolute
  if (imageUrl && !imageUrl.startsWith('http')) {
    try {
      const baseUrl = new URL(sourceUrl);
      const absoluteUrl = new URL(imageUrl, baseUrl.origin).href;
      console.info('Made URL absolute:', imageUrl, '->', absoluteUrl);
      imageUrl = absoluteUrl;
    } catch {
      console.info('Failed to make URL absolute, keeping original:', imageUrl);
    }
  }

  console.info('Final image URL:', imageUrl);

  // Collect tags
  const tags: string[] = [];
  if (jsonLd.recipeCategory) {
    const categories = Array.isArray(jsonLd.recipeCategory)
      ? jsonLd.recipeCategory
      : [jsonLd.recipeCategory];
    tags.push(...categories);
  }
  if (jsonLd.recipeCuisine) {
    const cuisines = Array.isArray(jsonLd.recipeCuisine)
      ? jsonLd.recipeCuisine
      : [jsonLd.recipeCuisine];
    tags.push(...cuisines);
  }
  if (jsonLd.keywords) {
    const keywords = Array.isArray(jsonLd.keywords) ? jsonLd.keywords : [jsonLd.keywords];
    tags.push(...keywords);
  }

  return {
    name: jsonLd.name || 'Imported Recipe',
    description: jsonLd.description || '',
    ingredients,
    instructions,
    servings: parseServingsString(jsonLd.recipeYield?.toString()),
    prepTimeMinutes: parseTimeToMinutes(jsonLd.prepTime),
    cookTimeMinutes: parseTimeToMinutes(jsonLd.cookTime),
    imageUrl,
    tags: tags.filter(Boolean),
    sourceUrl,
    isPublic: false,
  };
}

/**
 * Main function to scrape a recipe from a URL
 */
export async function scrapeRecipeFromUrl(url: string): Promise<ImportedRecipe> {
  try {
    console.info('Attempting to scrape URL:', url);

    // Validate URL format
    if (!isValidRecipeUrl(url)) {
      throw new Error('Invalid URL format');
    }

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    console.info('HTML fetched, length:', html.length);

    // Try to extract JSON-LD structured data
    const jsonLdRecipe = extractRecipeFromHtml(html);
    if (jsonLdRecipe) {
      console.info('Found JSON-LD recipe data');
      return transformJsonLdRecipe(jsonLdRecipe, url);
    }

    // Fall back to microdata parsing (using cheerio to extract microdata)
    const $ = cheerio.load(html);
    const microdataRecipe = extractMicrodataRecipe($, url);
    if (microdataRecipe) {
      console.info('Found microdata recipe');
      return transformMicrodataRecipe(microdataRecipe, url);
    }

    // Final fallback: basic HTML parsing
    console.info('Falling back to basic HTML parsing...');
    return extractBasicRecipeFromHtml($, url);
  } catch (error) {
    console.error('Error scraping recipe:', error);
    throw new Error(getImportErrorMessage(error));
  }
}

/**
 * Extract recipe data from microdata (fallback method)
 */
function extractMicrodataRecipe($: cheerio.CheerioAPI, sourceUrl: string): JsonLdRecipe | null {
  // Look for elements with itemtype="http://schema.org/Recipe" or "https://schema.org/Recipe"
  const recipeElement = $('[itemscope][itemtype*="schema.org/Recipe"]');

  if (recipeElement.length === 0) {
    return null;
  }

  const recipe: JsonLdRecipe = {};

  // Extract basic recipe info
  recipe.name = recipeElement.find('[itemprop="name"]').first().text().trim() || undefined;
  recipe.description =
    recipeElement.find('[itemprop="description"]').first().text().trim() || undefined;

  // Extract ingredients
  const ingredients: string[] = [];
  recipeElement.find('[itemprop="recipeIngredient"]').each((_, el) => {
    const ingredient = $(el).text().trim();
    if (ingredient) ingredients.push(ingredient);
  });
  recipe.recipeIngredient = ingredients.length > 0 ? ingredients : undefined;

  // Extract instructions
  const instructions: string[] = [];
  recipeElement.find('[itemprop="recipeInstructions"]').each((_, el) => {
    const instruction = $(el).text().trim();
    if (instruction) instructions.push(instruction);
  });
  recipe.recipeInstructions = instructions.length > 0 ? instructions : undefined;

  // Extract other fields
  recipe.recipeYield =
    recipeElement.find('[itemprop="recipeYield"]').first().text().trim() || undefined;
  recipe.prepTime =
    recipeElement.find('[itemprop="prepTime"]').first().attr('datetime') ||
    recipeElement.find('[itemprop="prepTime"]').first().text().trim() ||
    undefined;
  recipe.cookTime =
    recipeElement.find('[itemprop="cookTime"]').first().attr('datetime') ||
    recipeElement.find('[itemprop="cookTime"]').first().text().trim() ||
    undefined;

  // Extract image
  const imageEl = recipeElement.find('[itemprop="image"]').first();
  let imageUrl =
    imageEl.attr('src') || imageEl.attr('content') || imageEl.attr('href') || undefined;

  // Make URL absolute if it's relative
  if (imageUrl && !imageUrl.startsWith('http')) {
    try {
      const baseUrl = new URL(sourceUrl);
      imageUrl = new URL(imageUrl, baseUrl.origin).href;
    } catch {
      // Keep original if URL construction fails
    }
  }

  recipe.image = imageUrl;

  return Object.keys(recipe).length > 1 ? recipe : null; // Return null if we only have empty object
}

/**
 * Transform microdata recipe to our format (wrapper for JSON-LD transform)
 */
function transformMicrodataRecipe(microdata: JsonLdRecipe, sourceUrl: string): ImportedRecipe {
  return transformJsonLdRecipe(microdata, sourceUrl);
}

/**
 * Basic HTML parsing as final fallback
 */
function extractBasicRecipeFromHtml($: cheerio.CheerioAPI, sourceUrl: string): ImportedRecipe {
  // Try to extract basic info from common HTML patterns
  let name = '';

  // Try various common selectors for recipe titles
  const titleSelectors = [
    'h1.recipe-title',
    'h1.entry-title',
    '.recipe-header h1',
    '.recipe-title',
    'h1',
    'title',
  ];

  for (const selector of titleSelectors) {
    const titleEl = $(selector).first();
    if (titleEl.length && titleEl.text().trim()) {
      name = titleEl.text().trim();
      break;
    }
  }

  // Try to extract ingredients from common patterns
  const ingredients: Ingredient[] = [];
  const ingredientSelectors = [
    '.recipe-ingredients li',
    '.ingredients li',
    '.recipe-ingredient',
    '[class*="ingredient"]',
  ];

  for (const selector of ingredientSelectors) {
    $(selector).each((_, el) => {
      const text = $(el).text().trim();
      if (text && !text.toLowerCase().includes('advertisement')) {
        ingredients.push(parseIngredientString(text));
      }
    });
    if (ingredients.length > 0) break; // Stop after finding ingredients
  }

  // Try to extract instructions
  const instructions: string[] = [];
  const instructionSelectors = [
    '.recipe-instructions li',
    '.instructions li',
    '.recipe-instruction',
    '.directions li',
    '[class*="instruction"]',
    '[class*="direction"]',
  ];

  for (const selector of instructionSelectors) {
    $(selector).each((_, el) => {
      const text = $(el).text().trim();
      if (text && !text.toLowerCase().includes('advertisement')) {
        instructions.push(text);
      }
    });
    if (instructions.length > 0) break; // Stop after finding instructions
  }

  // Try to extract image URL
  let imageUrl: string | null = null;
  const imageSelectors = [
    '.recipe-image img',
    '.recipe-photo img',
    '.recipe-header img',
    '.hero-image img',
    'img[src*="recipe"]',
    'img[alt*="recipe"]',
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
  ];

  for (const selector of imageSelectors) {
    const el = $(selector).first();
    if (el.length) {
      let src = el.attr('src') || el.attr('content');
      if (src) {
        // Make URL absolute if it's relative
        if (!src.startsWith('http')) {
          try {
            const baseUrl = new URL(sourceUrl);
            src = new URL(src, baseUrl.origin).href;
          } catch {
            // Keep original if URL construction fails
          }
        }
        imageUrl = src;
        break;
      }
    }
  }

  return {
    name: name || 'Imported Recipe',
    description: '',
    ingredients,
    instructions,
    servings: 4, // Default fallback
    prepTimeMinutes: 0,
    cookTimeMinutes: 0,
    imageUrl,
    tags: [],
    sourceUrl,
    isPublic: false,
  };
}
