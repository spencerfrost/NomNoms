import {
  formatMinutes,
  importedRecipeToForm,
  importedRecipeToPayload,
  stashImportedRecipe,
  takeStashedImportedRecipe,
} from '@/lib/imported-recipe';
import { parseRecipeCreate } from '@/lib/recipe-schema';
import type { ImportedRecipe } from '@/lib/recipe-import-utils';

const imported: ImportedRecipe = {
  name: '  Chicken Tikka Masala ',
  description: 'Rich and creamy.',
  ingredients: [
    { amount: 1.5, unit: 'lb', name: 'chicken thighs' },
    { amount: 0, unit: '', name: 'salt to taste' },
    { amount: 1, unit: 'cup', name: '   ' },
  ],
  instructions: ['Marinate.', '  ', 'Simmer.'],
  servings: 4,
  prepTimeMinutes: 20,
  cookTimeMinutes: 90,
  imageUrl: 'https://cdn.example.com/tikka.jpg',
  tags: ['Indian', 'indian', 'Dinner', 'x'.repeat(51)],
  sourceUrl: 'https://example.com/tikka',
  isPublic: false,
};

describe('formatMinutes', () => {
  it.each([
    [0, ''],
    [45, '45 min'],
    [60, '1 hr'],
    [90, '1 hr 30 min'],
  ])('%i -> %j', (minutes, expected) => {
    expect(formatMinutes(minutes)).toBe(expected);
  });
});

describe('importedRecipeToPayload', () => {
  it('maps an imported recipe to a valid, private create payload', () => {
    const payload = importedRecipeToPayload(imported);
    expect(payload).toEqual({
      title: 'Chicken Tikka Masala',
      description: 'Rich and creamy.',
      image: 'https://cdn.example.com/tikka.jpg',
      yield: '4 servings',
      prepTime: '20 min',
      cookTime: '1 hr 30 min',
      sourceUrl: 'https://example.com/tikka',
      ingredients: [
        { amount: 1.5, unit: 'lb', name: 'chicken thighs' },
        { amount: 0, unit: '', name: 'salt to taste' },
      ],
      instructions: ['Marinate.', 'Simmer.'],
      tags: ['Indian', 'Dinner'],
      visibility: 'private',
    });
    expect(parseRecipeCreate(payload).ok).toBe(true);
  });

  it('keeps scraped data inside the schema limits', () => {
    const payload = importedRecipeToPayload({
      ...imported,
      name: 'x'.repeat(500),
      tags: Array.from({ length: 50 }, (_, i) => `tag${i}`),
      imageUrl: 'data:image/png;base64,abc',
      ingredients: [{ amount: 1e9, unit: 'u'.repeat(80), name: 'n'.repeat(300) }],
    });
    expect(parseRecipeCreate(payload).ok).toBe(true);
    expect(payload.image).toBeNull();
  });
});

describe('importedRecipeToPayload ranges', () => {
  it('keeps a valid range and drops a broken one', () => {
    const payload = importedRecipeToPayload({
      ...imported,
      ingredients: [
        { amount: 2, amountMax: 3, unit: 'tbsp', name: 'oil' },
        { amount: 3, amountMax: 2, unit: '', name: 'eggs' },
        { amount: 0, amountMax: 2, unit: '', name: 'salt' },
      ],
    });
    expect(payload.ingredients).toStrictEqual([
      { amount: 2, amountMax: 3, unit: 'tbsp', name: 'oil' },
      { amount: 3, unit: '', name: 'eggs' },
      { amount: 0, unit: '', name: 'salt' },
    ]);
    expect(parseRecipeCreate(payload).ok).toBe(true);
  });
});

describe('importedRecipeToForm', () => {
  it('prefills the add form, keeping no-amount ingredients', () => {
    const { formData, ingredients, instructions, tags } = importedRecipeToForm(imported);
    expect(formData).toMatchObject({
      title: 'Chicken Tikka Masala',
      yield: '4 servings',
      prepTime: '20 min',
      cookTime: '1 hr 30 min',
      visibility: 'private',
      sourceUrl: 'https://example.com/tikka',
      imageUrl: 'https://cdn.example.com/tikka.jpg',
    });
    expect(ingredients).toHaveLength(2);
    expect(instructions).toEqual(['Marinate.', 'Simmer.']);
    expect(tags).toEqual(['Indian', 'Dinner']);
  });

  it('leaves one empty row to edit when nothing was parsed', () => {
    const state = importedRecipeToForm({ ...imported, ingredients: [], instructions: [] });
    expect(state.ingredients).toEqual([{ amount: 0, unit: '', name: '' }]);
    expect(state.instructions).toEqual(['']);
  });
});

describe('stash', () => {
  beforeEach(() => sessionStorage.clear());

  it('hands the recipe over once', () => {
    stashImportedRecipe(imported);
    expect(takeStashedImportedRecipe()).toEqual(imported);
    expect(takeStashedImportedRecipe()).toBeNull();
  });

  it('ignores junk in storage', () => {
    sessionStorage.setItem('nomnoms:imported-recipe', '{"name": 1}');
    expect(takeStashedImportedRecipe()).toBeNull();
    sessionStorage.setItem('nomnoms:imported-recipe', 'not json');
    expect(takeStashedImportedRecipe()).toBeNull();
  });
});
