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

/**
 * Formats an ingredient string with an embedded amount and unit.
 * Example: formatAmount('1 1/2 cups flour') => '1 1/2 cups flour'
 *          formatAmount('0.5 cup sugar') => '1/2 cup sugar'
 */
export function formatAmount(ingredient: string): string {
  // Unicode fraction map
  const unicodeFractions: Record<string, string> = {
    '0.25': '¼', '0.5': '½', '0.75': '¾', '0.33': '⅓', '0.67': '⅔',
    '0.125': '⅛', '0.375': '⅜', '0.625': '⅝', '0.875': '⅞'
  };
  // Regex to match mixed, fraction, decimal, or unicode fraction at start
  const match = ingredient.match(/^((\d+\s)?\d+\/\d+|\d*\.?\d+|[¼½¾⅓⅔⅛⅜⅝⅞])/);
  if (!match) return ingredient;
  let amountStr = match[0];
  let rest = ingredient.slice(amountStr.length).trim();
  // Convert to decimal for formatting
  let amount = 0;
  if (/\d+\s+\d+\/\d+/.test(amountStr)) {
    // Mixed fraction
    const [whole, frac] = amountStr.split(' ');
    const [num, denom] = frac.split('/').map(Number);
    amount = parseInt(whole) + num / denom;
  } else if (/\d+\/\d+/.test(amountStr)) {
    // Simple fraction
    const [num, denom] = amountStr.split('/').map(Number);
    amount = num / denom;
  } else if (/[¼½¾⅓⅔⅛⅜⅝⅞]/.test(amountStr)) {
    // Unicode fraction
    const unicodeMap: Record<string, number> = {
      '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1/3, '⅔': 2/3, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
    };
    amount = unicodeMap[amountStr] || 0;
  } else {
    // Decimal or integer
    amount = parseFloat(amountStr);
  }
  // Format as unicode fraction if possible
  let formatted = '';
  const rounded = Math.round(amount * 100) / 100;
  if (unicodeFractions[rounded.toString()]) {
    formatted = unicodeFractions[rounded.toString()];
  } else if (amount % 1 === 0) {
    formatted = amount.toString();
  } else {
    formatted = rounded.toString();
  }
  return `${formatted} ${rest}`.trim();
}

// Utility: parse and scale the amount at the start of an ingredient string
export function scaleIngredientString(ingredient: string, multiplier: number): string {
  // Convert unicode fractions to decimal
  const unicodeFractions: Record<string, number> = {
    '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1/3, '⅔': 2/3, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
  };
  let match: RegExpExecArray | null = null;
  let amount = 0;
  let rest = ingredient;
  let original = '';

  // Mixed number (e.g. 1 1/2)
  match = /^\s*(\d+)\s+(\d+)\/(\d+)/.exec(ingredient);
  if (match) {
    amount = parseInt(match[1]) + parseInt(match[2]) / parseInt(match[3]);
    rest = ingredient.slice(match[0].length).trim();
    original = `${match[1]} ${match[2]}/${match[3]}`;
  } else {
    // Fraction (e.g. 3/4)
    match = /^\s*(\d+)\/(\d+)/.exec(ingredient);
    if (match) {
      amount = parseInt(match[1]) / parseInt(match[2]);
      rest = ingredient.slice(match[0].length).trim();
      original = `${match[1]}/${match[2]}`;
    } else {
      // Decimal (e.g. 1.5)
      match = /^\s*(\d*\.?\d+)/.exec(ingredient);
      if (match) {
        amount = parseFloat(match[1]);
        rest = ingredient.slice(match[0].length).trim();
        original = match[1];
      } else {
        // Unicode fraction (e.g. ½)
        match = /^\s*([¼½¾⅓⅔⅛⅜⅝⅞])/.exec(ingredient);
        if (match && unicodeFractions[match[1]]) {
          amount = unicodeFractions[match[1]];
          rest = ingredient.slice(match[0].length).trim();
          original = match[1];
        } else {
          return ingredient;
        }
      }
    }
  }

  // Scale
  const scaled = amount * multiplier;

  // Format as fraction if original was a fraction, else as decimal
  function toFraction(val: number): string {
    const tolerance = 1e-2;
    const denominators = [2, 3, 4, 8];
    for (const d of denominators) {
      const n = Math.round(val * d);
      if (Math.abs(val - n/d) < tolerance) {
        return `${n}/${d}`;
      }
    }
    return val.toFixed(2).replace(/\.00$/, '');
  }
  let scaledStr: string;
  if (/\d+\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞]/.test(original)) {
    scaledStr = toFraction(scaled);
  } else {
    scaledStr = scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2).replace(/\.00$/, '');
  }

  return `${scaledStr} ${rest}`.trim();
}

/**
 * Scales the first number or fraction in an ingredient string by the given multiplier.
 * Example: scaleIngredientStringAmount('1 1/2 cups flour', 2) => '3 cups flour'
 */
export function scaleIngredientStringAmount(ingredient: string, multiplier: number): string {
  function fractionToDecimal(str: string): number {
    if (str.includes(' ')) {
      const [whole, frac] = str.split(' ');
      const [num, denom] = frac.split('/').map(Number);
      return parseInt(whole) + num / denom;
    } else if (str.includes('/')) {
      const [num, denom] = str.split('/').map(Number);
      return num / denom;
    } else {
      return parseFloat(str);
    }
  }
  function decimalToFraction(decimal: number): string {
    const rounded = Math.round(decimal * 100) / 100;
    const fractions = [
      [0.25, '1/4'], [0.33, '1/3'], [0.5, '1/2'], [0.67, '2/3'], [0.75, '3/4'],
      [0.125, '1/8'], [0.375, '3/8'], [0.625, '5/8'], [0.875, '7/8']
    ];
    for (const [val, str] of fractions) {
      if (Math.abs(rounded - val) < 0.01) return str as string;
    }
    return rounded.toString();
  }
  // Use RegExp.exec() instead of String.match()
  const regex = /^((\d+\s)?\d+\/\d+|\d+(\.\d+)?)/;
  const match = regex.exec(ingredient);
  if (!match) return ingredient;
  const original = match[0];
  const scaled = fractionToDecimal(original) * multiplier;
  let scaledStr = '';
  if (scaled % 1 === 0) {
    scaledStr = scaled.toString();
  } else {
    scaledStr = decimalToFraction(scaled);
  }
  return ingredient.replace(original, scaledStr);
}
