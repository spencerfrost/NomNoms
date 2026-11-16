/**
 * Import-quality probe: runs the importer's parsing path (`parseRecipeHtml`) on every saved
 * page in ./pages and compares the result with ./expected.json.
 *
 *   pnpm probe:import            # table + totals
 *   pnpm probe:import --lines    # also list every wrong ingredient line
 *   pnpm probe:import --json     # machine-readable report
 *
 * Pages are saved HTML (trimmed of scripts/styles), never fetched live. See README.md here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseRecipeHtml, type RecipeExtractionMethod } from '@/lib/recipe-import-utils';

const DIR = __dirname;

type ExpectedLine = [line: string, amount: number, unit: string, flag?: 'range'];
interface ExpectedPage {
  url: string;
  steps: number;
  yield?: string;
  ingredients: ExpectedLine[];
}

/** Canonical unit names; the probe maps both expected and actual units through this. */
export const UNIT_ALIASES: Record<string, string> = {
  cup: 'cup', cups: 'cup', c: 'cup',
  tablespoon: 'tbsp', tablespoons: 'tbsp', tbsp: 'tbsp', tbs: 'tbsp', tbl: 'tbsp', T: 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp', tsp: 'tsp', t: 'tsp',
  gram: 'g', grams: 'g', g: 'g', kilogram: 'kg', kilograms: 'kg', kg: 'kg',
  milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml', ml: 'ml',
  liter: 'l', liters: 'l', litre: 'l', litres: 'l', l: 'l',
  ounce: 'oz', ounces: 'oz', oz: 'oz', pound: 'lb', pounds: 'lb', lb: 'lb', lbs: 'lb',
  can: 'can', cans: 'can', tin: 'can', tins: 'can',
};

export function canonicalUnit(unit: string): string {
  const u = unit.trim().replace(/\.$/, '');
  return UNIT_ALIASES[u] ?? UNIT_ALIASES[u.toLowerCase()] ?? u.toLowerCase();
}

const NUMBER_START = /^[\d¼½¾⅓⅔⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚⅐⅑⅒]/;
const CONNECTOR_START = /^(to|-|–|or|of|and)\b/i;
const ENTITY_OR_TAG = /&(#\d+|#x[0-9a-f]+|[a-z]+);|<\/?[a-z][^>]*>/i;

/** A name is a fragment if it still starts with a quantity, a connector or a unit word. */
export function isFragmentName(name: string): boolean {
  const n = name.trim();
  if (!n) return true;
  if (/^\d+(\.\d+)?%/.test(n)) return false; // "93% lean ground turkey"
  if (NUMBER_START.test(n) || CONNECTOR_START.test(n)) return true;
  const first = n.split(/[\s.,]+/)[0];
  return first in UNIT_ALIASES && first.length > 1;
}

interface LineResult {
  line: string;
  expected: { amount: number; unit: string };
  got: { amount: number; amountMax?: number; unit: string; name: string } | null;
  range: boolean;
  /** Range lines only: the high end came out in `amountMax`. */
  rangeOk: boolean;
  amountOk: boolean;
  unitOk: boolean;
  nameOk: boolean;
  /** Wrong non-zero amount: looks plausible, scales wrongly. Worse than 0. */
  misleading: boolean;
}

export interface PageReport {
  page: string;
  method: RecipeExtractionMethod | 'error';
  error?: string;
  ingredients: { expected: number; got: number; lines: LineResult[] };
  steps: { expected: number; got: number; duplicates: number; longest: number };
  entities: string[];
  tags: { count: number; commaJoined: number };
  servings: number;
}

function probePage(page: string, exp: ExpectedPage): PageReport {
  const html = fs.readFileSync(path.join(DIR, 'pages', `${page}.html`), 'utf8');
  const empty: PageReport = {
    page,
    method: 'error',
    ingredients: { expected: exp.ingredients.length, got: 0, lines: [] },
    steps: { expected: exp.steps, got: 0, duplicates: 0, longest: 0 },
    entities: [],
    tags: { count: 0, commaJoined: 0 },
    servings: 0,
  };

  let recipe, method: RecipeExtractionMethod;
  try {
    ({ recipe, method } = parseRecipeHtml(html, exp.url));
  } catch (error) {
    return { ...empty, error: error instanceof Error ? error.message : String(error) };
  }

  // Lines are compared by position. If the importer returned a different number of
  // ingredients (duplicates, headers, dropped lines), positional matching is meaningless,
  // so every expected line counts as unmatched.
  const aligned = recipe.ingredients.length === exp.ingredients.length;
  const lines: LineResult[] = exp.ingredients.map(([line, amount, unit, flag], i) => {
    const got = aligned ? recipe.ingredients[i] : null;
    const amountOk = !!got && Math.abs(got.amount - amount) < 0.01;
    const unitOk = !!got && (unit === '*' || canonicalUnit(got.unit) === canonicalUnit(unit));
    const nameOk = !!got && (amount === 0 ? !!got.name.trim() : !isFragmentName(got.name));
    return {
      line,
      expected: { amount, unit },
      got: got ? { amount: got.amount, amountMax: got.amountMax, unit: got.unit, name: got.name } : null,
      range: flag === 'range',
      rangeOk: flag === 'range' && !!got && got.amountMax !== undefined && got.amountMax > got.amount,
      amountOk,
      unitOk,
      nameOk,
      misleading: !!got && got.amount !== 0 && !amountOk,
    };
  });

  const texts = [
    recipe.name,
    recipe.description,
    ...recipe.instructions,
    ...recipe.tags,
    ...recipe.ingredients.flatMap(i => [i.unit, i.name]),
  ];

  return {
    page,
    method,
    ingredients: { expected: exp.ingredients.length, got: recipe.ingredients.length, lines },
    steps: {
      expected: exp.steps,
      got: recipe.instructions.length,
      duplicates: recipe.instructions.length - new Set(recipe.instructions.map(s => s.trim())).size,
      longest: Math.max(0, ...recipe.instructions.map(s => s.length)),
    },
    entities: texts.filter(t => ENTITY_OR_TAG.test(t)).map(t => t.slice(0, 80)),
    tags: { count: recipe.tags.length, commaJoined: recipe.tags.filter(t => t.includes(',')).length },
    servings: recipe.servings,
  };
}

export function probeCorpus(): PageReport[] {
  const expected = JSON.parse(fs.readFileSync(path.join(DIR, 'expected.json'), 'utf8')) as {
    pages: Record<string, ExpectedPage>;
  };
  const quiet = { info: console.info, error: console.error };
  console.info = () => {};
  console.error = () => {};
  try {
    return Object.entries(expected.pages).map(([page, exp]) => probePage(page, exp));
  } finally {
    Object.assign(console, quiet);
  }
}

export function summarize(reports: PageReport[]) {
  const lines = reports.flatMap(r => r.ingredients.lines);
  const nonRange = lines.filter(l => !l.range);
  const pct = (n: number, d: number) => (d ? Math.round((1000 * n) / d) / 10 : 0);
  return {
    pages: reports.length,
    byMethod: reports.reduce<Record<string, number>>(
      (acc, r) => ({ ...acc, [r.method]: (acc[r.method] ?? 0) + 1 }),
      {}
    ),
    ingredientLines: lines.length,
    amountCorrect: lines.filter(l => l.amountOk).length,
    amountCorrectPct: pct(lines.filter(l => l.amountOk).length, lines.length),
    fullyCorrect: lines.filter(l => l.amountOk && l.unitOk && l.nameOk).length,
    fullyCorrectPct: pct(lines.filter(l => l.amountOk && l.unitOk && l.nameOk).length, lines.length),
    nonRangeAmountCorrectPct: pct(nonRange.filter(l => l.amountOk).length, nonRange.length),
    rangesWithHighEnd: `${lines.filter(l => l.rangeOk).length}/${lines.filter(l => l.range).length}`,
    misleadingAmounts: lines.filter(l => l.misleading).length,
    wrongUnit: lines.filter(l => l.got && !l.unitOk).length,
    fragmentNames: lines.filter(l => l.got && !l.nameOk).length,
    unalignedPages: reports.filter(r => r.method !== 'error' && r.ingredients.got !== r.ingredients.expected).length,
    pagesLosingSteps: reports.filter(r => r.steps.got < r.steps.expected).length,
    pagesWithExtraOrDuplicateSteps: reports.filter(
      r => r.steps.got > r.steps.expected || r.steps.duplicates > 0
    ).length,
    pagesWithEntities: reports.filter(r => r.entities.length > 0).length,
    pagesWithCommaJoinedTags: reports.filter(r => r.tags.commaJoined > 0).length,
    errors: reports.filter(r => r.method === 'error').length,
  };
}

function printTable(reports: PageReport[], showLines: boolean) {
  const rows = reports.map(r => {
    const l = r.ingredients.lines;
    return {
      page: r.page,
      method: r.method,
      'ingr got/exp': `${r.ingredients.got}/${r.ingredients.expected}`,
      'amount ok': `${l.filter(x => x.amountOk).length}/${l.length}`,
      misleading: l.filter(x => x.misleading).length,
      'bad unit': l.filter(x => x.got && !x.unitOk).length,
      'bad name': l.filter(x => x.got && !x.nameOk).length,
      'steps got/exp': `${r.steps.got}/${r.steps.expected}${r.steps.duplicates ? ` (${r.steps.duplicates} dup)` : ''}`,
      entities: r.entities.length,
      'comma tags': r.tags.commaJoined,
    };
  });
  console.table(rows);
  if (showLines) {
    for (const r of reports) {
      if (r.error) console.log(`\n${r.page}: ERROR ${r.error}`);
      const bad = r.ingredients.lines.filter(
        l => l.got && !(l.amountOk && l.unitOk && l.nameOk && (!l.range || l.rangeOk))
      );
      if (!bad.length) continue;
      console.log(`\n${r.page}`);
      for (const l of bad) {
        const g = l.got!;
        console.log(
          `  ${JSON.stringify(l.line)}\n    got ${g.amount}${g.amountMax !== undefined ? `-${g.amountMax}` : ''} · ${JSON.stringify(g.unit)} · ${JSON.stringify(g.name)}` +
            `   want ${l.expected.amount} · ${l.expected.unit || '""'}${l.range ? ' (range)' : ''}`
        );
      }
      if (r.entities.length) console.log(`  entities: ${r.entities.map(e => JSON.stringify(e)).join(', ')}`);
    }
  }
}

if (require.main === module) {
  const reports = probeCorpus();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ summary: summarize(reports), reports }, null, 2));
  } else {
    printTable(reports, process.argv.includes('--lines'));
    console.log(summarize(reports));
  }
}
