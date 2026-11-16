/** @jest-environment node */
import { parseIngredientLine, parseIngredientLines } from '@/lib/ingredient-parser';
import { canonicalUnit, isFragmentName } from '../fixtures/import/probe';
import expected from '../fixtures/import/expected.json';

describe('parseIngredientLine', () => {
  // Lines the old regex parser got wrong (see the import data-quality doc).
  it.each([
    ['1 ½ cups warm milk', 1.5, 'cups', 'warm milk'],
    ['½ cup butter', 0.5, 'cup', 'butter'],
    ['1½ tablespoons cornstarch', 1.5, 'tablespoons', 'cornstarch'],
    ['1-1/3 cups packed brown sugar', 4 / 3, 'cups', 'packed brown sugar'],
    ['5-1/2 cups hot mashed potatoes', 5.5, 'cups', 'hot mashed potatoes'],
    ['1 and 1/2 cups milk', 1.5, 'cups', 'milk'],
    ['1 lb. ground beef', 1, 'lb', 'ground beef'],
    ['2 tsp. vanilla extract', 2, 'tsp', 'vanilla extract'],
    ['1 (15 ounce) can pumpkin', 1, 'can', '(15 ounce) pumpkin'],
    ['4 chicken breasts', 4, '', 'chicken breasts'],
    ['2 large eggs', 2, '', 'large eggs'],
    ['100g plain flour', 100, 'g', 'plain flour'],
    ['300ml milk', 300, 'ml', 'milk'],
    ['8 tablespoons of salted butter', 8, 'tablespoons', 'salted butter'],
  ])('%s', (line, amount, unit, name) => {
    const result = parseIngredientLine(line);
    expect(result).not.toBeNull();
    expect(result!.amount).toBeCloseTo(amount, 6);
    expect(result!.unit).toBe(unit);
    expect(result!.name).toBe(name);
  });

  it('stores a range as amount and amountMax', () => {
    const oil = { amount: 2, amountMax: 3, unit: 'tablespoons', name: 'olive oil' };
    expect(parseIngredientLine('2-3 tablespoons olive oil')).toEqual(oil);
    expect(parseIngredientLine('2 to 3 tablespoons olive oil')).toEqual(oil);
    expect(parseIngredientLine('2–3 tablespoons olive oil')).toEqual(oil);
    expect(parseIngredientLine('1/2 to 2/3 cup hot water')).toEqual({
      amount: 0.5,
      amountMax: 2 / 3,
      unit: 'cup',
      name: 'hot water',
    });
    expect(parseIngredientLine('1 or 2 onions')).toEqual({ amount: 1, amountMax: 2, unit: '', name: 'onions' });
    expect(parseIngredientLine('2 - 2 1/2 cups stock')).toMatchObject({ amount: 2, amountMax: 2.5 });
  });

  it('reads a range with the unit written on both ends', () => {
    expect(parseIngredientLine('1 cup to 1½ cups flour')).toEqual({
      amount: 1,
      amountMax: 1.5,
      unit: 'cups',
      name: 'flour',
    });
    expect(parseIngredientLine('100g-150g sugar')).toEqual({ amount: 100, amountMax: 150, unit: 'g', name: 'sugar' });
    expect(parseIngredientLine('1 Tbsp. to 2 Tbsp. oil')).toEqual({ amount: 1, amountMax: 2, unit: 'Tbsp', name: 'oil' });
  });

  it('leaves amountMax off when it is not a range', () => {
    expect(parseIngredientLine('2 cups flour')).not.toHaveProperty('amountMax');
    expect(parseIngredientLine('5-1/2 cups hot mashed potatoes')).not.toHaveProperty('amountMax');
  });

  it('keeps thirds exact so they display as fractions', () => {
    expect(parseIngredientLine('⅓ cup tahini')!.amount).toBe(1 / 3);
  });

  it('keeps the whole line as the name when there is no amount', () => {
    expect(parseIngredientLine('Salt to taste')).toEqual({ amount: 0, unit: '', name: 'Salt to taste' });
  });

  it('returns null for blank lines and group headers', () => {
    expect(parseIngredientLine('')).toBeNull();
    expect(parseIngredientLine('   ')).toBeNull();
    expect(parseIngredientLine('MEAT FILLING:')).toBeNull();
    expect(parseIngredientLine('For the sauce:')).toBeNull();
  });

  it('moves the alternate measurement out of the front of the name', () => {
    expect(parseIngredientLine('1 kg / 2 lb beef mince')).toEqual({
      amount: 1,
      unit: 'kg',
      name: 'beef mince (2 lb)',
    });
    expect(parseIngredientLine('400g / 14oz white mushrooms')?.name).toBe('white mushrooms (14oz)');
  });

  it('tidies WP Recipe Maker note markup without breaking real nesting', () => {
    expect(parseIngredientLine('4 chicken drumsticks ((Note 1))')?.name).toBe('chicken drumsticks (Note 1)');
    expect(parseIngredientLine('3 garlic cloves (, finely minced)')?.name).toBe('garlic cloves (finely minced)');
    expect(
      parseIngredientLine('4 chicken thighs, skin on ((~250g/8oz each) (Note 1))')?.name
    ).toBe('chicken thighs, skin on (~250g/8oz each) (Note 1)');
    expect(parseIngredientLine('2 cups gruyere (, shred yourself (Note 4))')?.name).toBe(
      'gruyere (shred yourself (Note 4))'
    );
  });
});

describe('parseIngredientLines', () => {
  it('drops blanks and group headers', () => {
    expect(parseIngredientLines(['For the dough:', '2 cups flour', '', '1 tsp salt'])).toEqual([
      { amount: 2, unit: 'cups', name: 'flour' },
      { amount: 1, unit: 'tsp', name: 'salt' },
    ]);
  });
});

describe('import corpus', () => {
  type Line = [string, number, string, string?];
  const lines = Object.entries(expected.pages).flatMap(([page, p]) =>
    (p.ingredients as Line[]).map(([line, amount, unit]) => ({ page, line, amount, unit }))
  );

  it.each(lines)('$page: $line', ({ line, amount, unit }) => {
    const result = parseIngredientLine(line.replace(/&amp;/g, '&'));
    expect(result).not.toBeNull();
    expect(result!.amount).toBeCloseTo(amount, 2);
    if (unit !== '*') expect(canonicalUnit(result!.unit)).toBe(canonicalUnit(unit));
    if (amount !== 0) expect(isFragmentName(result!.name)).toBe(false);
  });
});
