/**
 * Utilities for parsing and formatting ingredient amounts
 * This normalizes all amounts to decimal numbers for easy scaling,
 * while providing user-friendly fraction display formatting.
 */

export interface ParsedAmount {
  decimal: number;
  originalFormat?: 'fraction' | 'mixed' | 'decimal' | 'unicode';
}

/**
 * Parse any amount string or number into a decimal number
 */
export function parseAmountToDecimal(amount: string | number): number {
  if (typeof amount === 'number') {
    return amount;
  }

  const str = amount.toString().trim();
  if (!str || str === '0') return 0;

  // Handle "X and Y/Z" format (e.g., "1 and 1/2")
  let match = /^(\d*\.?\d+)\s+and\s+(\d+)\/(\d+)/.exec(str);
  if (match) {
    const whole = parseFloat(match[1]);
    const num = parseInt(match[2]);
    const denom = parseInt(match[3]);
    return whole + num / denom;
  }

  // Handle "X Y/Z" format (e.g., "1 1/2")
  match = /^(\d+)\s+(\d+)\/(\d+)/.exec(str);
  if (match) {
    const whole = parseInt(match[1]);
    const num = parseInt(match[2]);
    const denom = parseInt(match[3]);
    return whole + num / denom;
  }

  // Handle "Y/Z" format (e.g., "3/4")
  match = /^(\d+)\/(\d+)/.exec(str);
  if (match) {
    const num = parseInt(match[1]);
    const denom = parseInt(match[2]);
    return num / denom;
  }

  // Handle unicode fractions
  const unicodeMap: Record<string, number> = {
    '¼': 0.25,
    '½': 0.5,
    '¾': 0.75,
    '⅓': 1 / 3,
    '⅔': 2 / 3,
    '⅛': 0.125,
    '⅜': 0.375,
    '⅝': 0.625,
    '⅞': 0.875,
  };

  // Check for unicode fractions with optional whole number prefix
  match = /^(\d+)?\s*([¼½¾⅓⅔⅛⅜⅝⅞])/.exec(str);
  if (match) {
    const whole = match[1] ? parseInt(match[1]) : 0;
    const fraction = unicodeMap[match[2]] || 0;
    return whole + fraction;
  }

  // Handle decimal numbers (e.g., "1.5", "2")
  match = /^(\d*\.?\d+)/.exec(str);
  if (match) {
    return parseFloat(match[1]);
  }

  return 0;
}

/**
 * Convert a decimal number to a user-friendly fraction string
 */
export function formatDecimalAsFraction(decimal: number): string {
  if (decimal === 0) return '0';

  const tolerance = 1e-6;
  const whole = Math.floor(decimal);
  const fraction = decimal - whole;

  if (fraction < tolerance) {
    return whole.toString();
  }

  // Common fractions to check
  const commonFractions: [number, string][] = [
    [1 / 8, '1/8'],
    [1 / 4, '1/4'],
    [1 / 3, '1/3'],
    [3 / 8, '3/8'],
    [1 / 2, '1/2'],
    [5 / 8, '5/8'],
    [2 / 3, '2/3'],
    [3 / 4, '3/4'],
    [7 / 8, '7/8'],
  ];

  // Find closest common fraction
  for (const [value, display] of commonFractions) {
    if (Math.abs(fraction - value) < tolerance) {
      return whole > 0 ? `${whole} ${display}` : display;
    }
  }

  // If no common fraction matches, use decimal
  if (decimal % 1 === 0) {
    return decimal.toString();
  } else {
    return decimal.toFixed(2).replace(/\.?0+$/, '');
  }
}

/**
 * Scale an amount and return a user-friendly formatted string
 */
export function scaleAndFormatAmount(amount: string | number, multiplier: number): string {
  const decimal = parseAmountToDecimal(amount);
  const scaled = decimal * multiplier;
  return formatDecimalAsFraction(scaled);
}

/**
 * Normalize an ingredient amount to a decimal number
 * This should be used when processing/importing recipe data
 */
export function normalizeIngredientAmount(ingredient: {
  amount: string | number;
  unit: string;
  name: string;
}) {
  return {
    ...ingredient,
    amount: parseAmountToDecimal(ingredient.amount),
  };
}
