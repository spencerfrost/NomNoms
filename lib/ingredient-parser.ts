/**
 * Turns an ingredient line ("1½ cups (200 g) flour") into our `Ingredient` shape.
 *
 * Wraps `parse-ingredient`, which handles unicode and mixed fractions, ranges, unit
 * spellings and group headers, and corrects the few cases where its reading doesn't match
 * how recipes are written. Measured against the corpus in `__tests__/fixtures/import/`
 * (`pnpm probe:import`).
 *
 * Client-safe: no Node imports.
 */
import { parseIngredient } from 'parse-ingredient';
import type { Ingredient } from '@/types/recipe';

/** Size words the library would otherwise take as units ("2 large eggs" -> unit "large"). */
const IGNORED_UNITS = ['small', 'medium', 'large'];

/** "5-1/2 cups": a dash between a whole number and a fraction is a mixed number, not a range. */
const DASHED_MIXED_NUMBER = /^\s*\d+\s*-\s*\d+\s*\/\s*\d+/;

/**
 * Parses one ingredient line. Returns `null` for blank lines and group headers
 * ("For the sauce:"), which aren't ingredients.
 *
 * - No amount ("Salt to taste") gives `amount: 0` and the whole line as the name.
 * - A range ("2-3 Tbsp oil") stores the low value in `amount` and the high value in
 *   `amountMax`, so both ends scale.
 * - The unit is kept as written ("Tbsp", "cups"), without a trailing period.
 */
export function parseIngredientLine(line: string): Ingredient | null {
  const text = normalize(line);
  if (!text) return null;

  // round: false keeps 1/3 as 0.333…, so the display can show it as a fraction again.
  const [parsed] = parseIngredient(text, { ignoreUOMs: IGNORED_UNITS, round: false });
  if (!parsed || parsed.isGroupHeader) return null;

  let amount = parsed.quantity ?? 0;
  let upTo = parsed.quantity2;
  if (upTo !== null && (upTo < amount || DASHED_MIXED_NUMBER.test(text))) {
    // The library reads "5-1/2" as the range 5 to 1/2.
    amount += upTo;
    upTo = null;
  }

  const unit = (parsed.unitOfMeasure ?? '').replace(/\.$/, '');
  const name = tidyName(parsed.description) || text;

  if (upTo !== null && amount > 0 && upTo > amount) {
    return { amount, amountMax: upTo, unit, name };
  }
  return { amount, unit, name };
}

/** Parses many lines, dropping blanks and group headers. */
export function parseIngredientLines(lines: readonly string[]): Ingredient[] {
  return lines.map(parseIngredientLine).filter((i): i is Ingredient => i !== null);
}

function normalize(line: string): string {
  return (
    line
      .replace(/\s+/g, ' ')
      .trim()
      // "1 and 1/2 cups" -> "1 1/2 cups" (the library leaves "and 1/2" in the name)
      .replace(/^(\d+)\s+and\s+(\d+\s*\/\s*\d+)/i, '$1 $2')
      .replace(REPEATED_UNIT_RANGE, collapseRepeatedUnit)
  );
}

const NUM = String.raw`\d+(?:[.,]\d+)?(?:\s*\/\s*\d+|\s+\d+\s*\/\s*\d+)?[¼½¾⅓⅔⅛⅜⅝⅞]?|[¼½¾⅓⅔⅛⅜⅝⅞]`;
/** "1 cup to 1½ cups flour", "100g-150g sugar": a range with the unit written on both ends. */
const REPEATED_UNIT_RANGE = new RegExp(
  String.raw`^(${NUM})\s*([a-z]+)\.?\s*(?:to|-|–|—)\s*(${NUM})\s*([a-z]+)\.?(?=\s|$)`,
  'i'
);

/** "1 cup to 1½ cups" -> "1 to 1½ cups", when both units are the same word (singular or plural). */
function collapseRepeatedUnit(match: string, low: string, unit1: string, high: string, unit2: string) {
  const stem = (u: string) => u.toLowerCase().replace(/e?s$/, '');
  return stem(unit1) === stem(unit2) ? `${low} to ${high} ${unit2}` : match;
}

/** "/ 14oz white mushrooms" (left over from "400g / 14oz ...") */
const ALTERNATE_MEASURE = /^\/\s*([\d.,/¼½¾⅓⅔⅛⅜⅝⅞]+\s*[a-z]+\.?)\s+(.+)$/i;

/**
 * Cleans up what's left in the name after the amount and unit are taken out:
 * - "/ 14oz white mushrooms" -> "white mushrooms (14oz)"
 * - WP Recipe Maker notes: "((Note 1))" -> "(Note 1)", "(, finely chopped)" -> "(finely chopped)"
 */
function tidyName(name: string): string {
  let n = name.trim();
  const alternate = ALTERNATE_MEASURE.exec(n);
  if (alternate) n = `${alternate[2]} (${alternate[1]})`;
  return unwrapDoubleParens(n)
    .replace(/\(\s*,\s*/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Removes a redundant outer pair of parentheses around a group that is itself fully
 * parenthesised: "((~250g each) (Note 1))" -> "(~250g each) (Note 1)". Leaves real nesting
 * like "(shred yourself (Note 4))" alone.
 */
function unwrapDoubleParens(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(' && text[i + 1] === '(') {
      const close = matchingParen(text, i);
      if (close > 0 && text[close - 1] === ')') {
        out += unwrapDoubleParens(text.slice(i + 1, close));
        i = close;
        continue;
      }
    }
    out += text[i];
  }
  return out;
}

function matchingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')' && --depth === 0) return i;
  }
  return -1;
}
