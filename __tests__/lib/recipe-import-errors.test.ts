/**
 * @jest-environment node
 */
import { FetchError, UnsafeUrlError, safeFetchText } from '@/lib/safe-fetch';

// jest.setup.ts mocks this module globally; these tests need the real one.
jest.unmock('@/lib/recipe-import-utils');
jest.mock('@/lib/safe-fetch', () => ({
  ...jest.requireActual('@/lib/safe-fetch'),
  safeFetchText: jest.fn(),
}));

import {
  MAX_CLIPPED_HTML_LENGTH,
  RecipeImportError,
  parseClippedRecipe,
  scrapeRecipeFromUrl,
} from '@/lib/recipe-import-utils';

const mockFetch = safeFetchText as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

async function codeFor(error: unknown) {
  mockFetch.mockRejectedValue(error);
  const thrown = await scrapeRecipeFromUrl('https://example.com/r').catch(e => e);
  expect(thrown).toBeInstanceOf(RecipeImportError);
  return (thrown as RecipeImportError).code;
}

describe('scrapeRecipeFromUrl error codes', () => {
  it('rejects malformed URLs before fetching', async () => {
    const thrown = await scrapeRecipeFromUrl('not a url').catch(e => e);
    expect(thrown).toMatchObject({ code: 'invalid_url' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it.each([
    [new UnsafeUrlError(), 'invalid_url'],
    [new FetchError('unresolvable', 'x'), 'unreachable'],
    [new FetchError('timeout', 'x'), 'timeout'],
    [new FetchError('http', 'x', 404), 'not_found'],
    [new FetchError('http', 'x', 410), 'not_found'],
    [new FetchError('http', 'x', 402), 'blocked'],
    [new FetchError('http', 'x', 403), 'blocked'],
    [new FetchError('http', 'x', 429), 'blocked'],
    [new FetchError('http', 'x', 503), 'fetch_failed'],
    [new FetchError('too_large', 'x'), 'fetch_failed'],
    [new FetchError('too_many_redirects', 'x'), 'fetch_failed'],
    [new FetchError('network', 'x'), 'fetch_failed'],
  ])('maps %p to %s', async (error, code) => {
    await expect(codeFor(error)).resolves.toBe(code);
  });

  it('reports no_recipe for a page with nothing recipe-like on it', async () => {
    mockFetch.mockResolvedValue({ text: '<html><body><p>Hello</p></body></html>' });
    await expect(scrapeRecipeFromUrl('https://example.com/r')).rejects.toMatchObject({
      code: 'no_recipe',
    });
  });

  it('lets unexpected errors through unchanged', async () => {
    const bug = new TypeError('cannot read properties of undefined');
    mockFetch.mockRejectedValue(bug);
    await expect(scrapeRecipeFromUrl('https://example.com/r')).rejects.toBe(bug);
  });
});

describe('parseClippedRecipe', () => {
  const page = `<html><head><script type="application/ld+json">${JSON.stringify({
    '@type': 'Recipe',
    name: 'Soft Oatmeal Cookies',
    recipeIngredient: ['1 cup oats'],
    recipeInstructions: ['Bake.'],
  })}</script></head><body></body></html>`;

  it('parses the html without fetching', () => {
    const recipe = parseClippedRecipe(page, 'https://www.allrecipes.com/recipe/1/cookies/');
    expect(recipe.name).toBe('Soft Oatmeal Cookies');
    expect(recipe.sourceUrl).toBe('https://www.allrecipes.com/recipe/1/cookies/');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects a non-http url', () => {
    expect(() => parseClippedRecipe(page, 'javascript:alert(1)')).toThrow(
      expect.objectContaining({ code: 'invalid_url' })
    );
  });

  it('rejects oversized pages', () => {
    const huge = 'x'.repeat(MAX_CLIPPED_HTML_LENGTH + 1);
    expect(() => parseClippedRecipe(huge, 'https://example.com/r')).toThrow(
      expect.objectContaining({ code: 'too_large' })
    );
  });

  it('reports pages with no recipe', () => {
    expect(() => parseClippedRecipe('<html><body>hi</body></html>', 'https://example.com/r')).toThrow(
      expect.objectContaining({ code: 'no_recipe' })
    );
  });
});
