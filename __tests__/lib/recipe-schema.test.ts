import { isAllowedImageUrl, parseRecipeCreate, parseRecipeUpdate } from '@/lib/recipe-schema';

const valid = {
  title: 'Pancakes',
  ingredients: [{ amount: 1.5, unit: 'cup', name: 'flour' }],
  instructions: ['Mix', 'Cook'],
};

const errorOf = (result: ReturnType<typeof parseRecipeCreate>) =>
  result.ok ? undefined : result.error;

describe('parseRecipeCreate', () => {
  it('applies defaults and normalizes text', () => {
    const result = parseRecipeCreate({ ...valid, title: '  Pancakes  ', yield: '  ', tags: ['a', 'a'] });
    expect(result).toEqual({
      ok: true,
      data: {
        ...valid,
        description: '',
        tags: ['a'],
        visibility: 'public',
        yield: null,
      },
    });
  });

  it('strips fields clients may not set', () => {
    const result = parseRecipeCreate({ ...valid, authorId: 'someone-else', slug: 'x', id: '1' });
    expect(result.ok && result.data).not.toHaveProperty('authorId');
    expect(result.ok && result.data).not.toHaveProperty('slug');
    expect(result.ok && result.data).not.toHaveProperty('id');
  });

  it.each([
    [{ ...valid, title: '   ' }, 'Title is required'],
    [{ ...valid, ingredients: [] }, 'At least one ingredient is required'],
    [{ ...valid, instructions: [] }, 'At least one instruction is required'],
    [{ ...valid, instructions: 'Mix' }, 'Instructions must be an array of strings'],
    [{ ...valid, visibility: 'secret' }, 'Visibility must be "public" or "private"'],
    [{ ...valid, ingredients: [{ amount: '2', unit: '', name: 'egg' }] }, 'Ingredient 1: amount must be a number'],
    [
      { ...valid, ingredients: [valid.ingredients[0], { amount: -1, unit: '', name: 'egg' }] },
      'Ingredient 2: amount cannot be negative',
    ],
    [{ ...valid, ingredients: [{ amount: 1, unit: '', name: ' ' }] }, 'Ingredient 1: name is required'],
    [{ ...valid, image: 'javascript:alert(1)' }, 'Image must be an http(s) URL'],
    [{ ...valid, tags: Array.from({ length: 31 }, (_, i) => `t${i}`) }, 'At most 30 tags'],
  ])('rejects %j', (body, message) => {
    expect(errorOf(parseRecipeCreate(body))).toBe(message);
  });

  it.each([null, 'string', 42, []])('rejects a non-object body %j', body => {
    expect(errorOf(parseRecipeCreate(body))).toBe('Request body must be a JSON object');
  });

  it('keeps zero-amount ingredients ("salt to taste")', () => {
    const ingredients = [{ amount: 0, unit: '', name: 'salt' }];
    const result = parseRecipeCreate({ ...valid, ingredients });
    expect(result.ok && result.data.ingredients).toEqual(ingredients);
  });
});

describe('parseRecipeUpdate', () => {
  it('leaves omitted fields out instead of applying create defaults', () => {
    const result = parseRecipeUpdate({ title: 'New' });
    expect(result).toEqual({ ok: true, data: { title: 'New' } });
  });

  it('accepts an empty update', () => {
    expect(parseRecipeUpdate({})).toEqual({ ok: true, data: {} });
  });

  it('turns null and blank optional strings into null (clear), and trims the rest', () => {
    const result = parseRecipeUpdate({ image: null, yield: '', prepTime: ' 10 min ' });
    expect(result).toEqual({ ok: true, data: { image: null, yield: null, prepTime: '10 min' } });
  });

  it('still validates fields that are present', () => {
    expect(parseRecipeUpdate({ ingredients: [] }).ok).toBe(false);
    expect(parseRecipeUpdate({ image: 42 }).ok).toBe(false);
  });
});

describe('isAllowedImageUrl', () => {
  it.each([
    ['https://example.com/a.jpg', true],
    ['http://example.com/a.jpg', true],
    ['/images/recipes/a.jpg', true],
    ['//evil.example/a.jpg', false],
    ['data:image/png;base64,AAAA', false],
    ['not a url', false],
  ])('%s -> %s', (url, expected) => {
    expect(isAllowedImageUrl(url)).toBe(expected);
  });
});
