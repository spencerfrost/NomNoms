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

/** An ingredient's amount: a single value, or a range when `amountMax` is set. */
export interface AmountRange {
  amount: number;
  amountMax?: number;
}

/**
 * Formats an ingredient's amount for display, scaled: "2", "1 1/2", "2–3".
 * Returns '' when there is no amount (`amount: 0`).
 */
export function formatAmountRange(
  { amount, amountMax }: AmountRange,
  multiplier = 1,
  separator = '–'
): string {
  if (!(amount > 0)) return '';
  const low = formatDecimalAsFraction(amount * multiplier);
  if (amountMax === undefined || !(amountMax > amount)) return low;
  return `${low}${separator}${formatDecimalAsFraction(amountMax * multiplier)}`;
}

/** The amount as the editor shows it: like the display, with a plain hyphen that's easy to type. */
export function formatAmountInput(range: AmountRange): string {
  return formatAmountRange(range, 1, '-');
}

const UNICODE_FRACTIONS: Record<string, number> = {
  '¼': 1 / 4, '½': 1 / 2, '¾': 3 / 4, '⅓': 1 / 3, '⅔': 2 / 3,
  '⅛': 1 / 8, '⅜': 3 / 8, '⅝': 5 / 8, '⅞': 7 / 8,
};

/** One amount, strictly: "2", "1.5", ".5", "1/2", "1 1/2", "½", "1½". Anything else is null. */
function parseSingleAmount(text: string): number | null {
  const s = text.trim();
  let m: RegExpExecArray | null;
  if ((m = /^(\d*\.?\d+)$/.exec(s))) return parseFloat(m[1]);
  if ((m = /^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/.exec(s))) {
    const denominator = parseInt(m[3]);
    if (denominator === 0) return null;
    return (m[1] ? parseInt(m[1]) : 0) + parseInt(m[2]) / denominator;
  }
  if ((m = /^(\d+)?\s*([¼½¾⅓⅔⅛⅜⅝⅞])$/.exec(s))) {
    return (m[1] ? parseInt(m[1]) : 0) + UNICODE_FRACTIONS[m[2]];
  }
  return null;
}

/** "1-1/2": a dash between a whole number and a fraction is a mixed number, as in recipes. */
const DASHED_MIXED_NUMBER = /^(\d+)\s*-\s*(\d+\s*\/\s*\d+)$/;
const RANGE_SEPARATOR = /\s*(?:-|–|—|\bto\b)\s*/i;

/**
 * Parses what someone typed in an amount field: a single amount ("2", "1 1/2", "½") or a
 * range ("2-3", "2 – 3", "1/2 to 2/3"). Blank means no amount (`{ amount: 0 }`).
 * Returns null for text that isn't an amount, or a range whose high end is lower.
 */
export function parseAmountRange(text: string): AmountRange | null {
  const s = text.trim().replace(DASHED_MIXED_NUMBER, '$1 $2');
  if (!s) return { amount: 0 };

  const parts = s.split(RANGE_SEPARATOR);
  if (parts.length > 2) return null;
  const [amount, amountMax] = parts.map(parseSingleAmount);
  if (amount === null || amountMax === null) return null;
  if (amountMax === undefined || amountMax === amount) return { amount };
  if (!(amount > 0) || amountMax < amount) return null;
  return { amount, amountMax };
}

/** Same amount or range. Treats a missing `amountMax` and `undefined` alike. */
export function isSameAmount(a: AmountRange, b: AmountRange): boolean {
  return a.amount === b.amount && (a.amountMax ?? null) === (b.amountMax ?? null);
}

/** Returns the ingredient with a new amount, dropping `amountMax` when it isn't a range. */
export function withAmount<T extends AmountRange>(ingredient: T, range: AmountRange): T {
  const { amountMax: _previous, ...rest } = ingredient;
  void _previous;
  return (
    range.amountMax === undefined
      ? { ...rest, amount: range.amount }
      : { ...rest, amount: range.amount, amountMax: range.amountMax }
  ) as T;
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
