/**
 * @jest-environment node
 */
import {
  RecipeSearchError,
  buildSearchQuery,
  createBraveProvider,
  mapBraveResponse,
  searchRecipes,
  type SearchProvider,
} from '@/lib/recipe-search';

jest.mock('@/lib/env', () => ({ env: { BRAVE_SEARCH_API_KEY: undefined } }));

const braveBody = {
  query: { more_results_available: true },
  web: {
    results: [
      {
        title: 'Chicken <strong>Tikka Masala</strong> Recipe',
        url: 'https://www.seriouseats.com/chicken-tikka-masala',
        description: 'A rich, <strong>creamy</strong> sauce &amp; charred chicken.',
        profile: { name: 'Serious Eats' },
        thumbnail: { src: 'https://imgs.search.brave.com/abc.jpg' },
      },
      {
        title: 'No profile',
        url: 'https://example.com/tikka',
        description: '',
      },
      { title: 'Not a web page', url: 'ftp://example.com/file' },
      { title: 'Missing URL' },
      'garbage',
    ],
  },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('buildSearchQuery', () => {
  it('appends "recipe" to the query', () => {
    expect(buildSearchQuery('  chicken   tikka masala ')).toBe('chicken tikka masala recipe');
  });

  it('does not repeat "recipe" when the user already wrote it', () => {
    expect(buildSearchQuery('best pancake recipes')).toBe('best pancake recipes');
  });
});

describe('mapBraveResponse', () => {
  it('maps results to plain-text title, site, snippet and thumbnail', () => {
    const { results, hasMore } = mapBraveResponse(braveBody, 0);
    expect(hasMore).toBe(true);
    expect(results).toEqual([
      {
        title: 'Chicken Tikka Masala Recipe',
        url: 'https://www.seriouseats.com/chicken-tikka-masala',
        site: 'Serious Eats',
        snippet: 'A rich, creamy sauce & charred chicken.',
        thumbnail: 'https://imgs.search.brave.com/abc.jpg',
      },
      {
        title: 'No profile',
        url: 'https://example.com/tikka',
        site: 'example.com',
        snippet: '',
        thumbnail: null,
      },
    ]);
  });

  it('treats a response without web results as empty', () => {
    expect(mapBraveResponse({ query: {} }, 0)).toEqual({ results: [], hasMore: false });
    expect(mapBraveResponse({ web: { results: 'nope' } }, 0)).toEqual({
      results: [],
      hasMore: false,
    });
  });

  it('rejects a body that is not an object', () => {
    for (const body of [null, 'text', [1, 2], 42]) {
      expect(() => mapBraveResponse(body, 0)).toThrow(RecipeSearchError);
    }
  });

  it('stops paging at the provider limit', () => {
    expect(mapBraveResponse(braveBody, 9).hasMore).toBe(false);
  });
});

describe('createBraveProvider', () => {
  it('calls the Brave endpoint with the key header and paging params', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(braveBody));
    const provider = createBraveProvider('secret-key', fetchImpl);
    await provider.search('tikka recipe', 2, new AbortController().signal);

    const [url, init] = fetchImpl.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://api.search.brave.com/res/v1/web/search');
    expect(parsed.searchParams.get('q')).toBe('tikka recipe');
    expect(parsed.searchParams.get('offset')).toBe('2');
    expect(parsed.searchParams.get('count')).toBe('20');
    expect(init.headers['X-Subscription-Token']).toBe('secret-key');
  });

  it('turns an error status into an upstream error', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ error: 'quota' }, 429));
    const provider = createBraveProvider('k', fetchImpl);
    await expect(provider.search('q', 0, new AbortController().signal)).rejects.toMatchObject({
      code: 'upstream',
      status: 429,
    });
  });

  it('turns an unreadable body into bad_response', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(new Response('<html>', { status: 200 }));
    const provider = createBraveProvider('k', fetchImpl);
    await expect(provider.search('q', 0, new AbortController().signal)).rejects.toMatchObject({
      code: 'bad_response',
    });
  });
});

describe('searchRecipes', () => {
  it('sends the query with "recipe" appended to the provider', async () => {
    const provider: SearchProvider = {
      search: jest.fn().mockResolvedValue({ results: [], hasMore: false }),
    };
    await searchRecipes('pad thai', 1, { provider });
    expect(provider.search).toHaveBeenCalledWith('pad thai recipe', 1, expect.any(AbortSignal));
  });

  it('reports not_configured without an API key', async () => {
    await expect(searchRecipes('pad thai')).rejects.toMatchObject({ code: 'not_configured' });
  });

  it('times out even when the provider ignores the abort signal', async () => {
    const provider: SearchProvider = { search: () => new Promise(() => {}) };
    await expect(searchRecipes('slow', 0, { provider, timeoutMs: 20 })).rejects.toMatchObject({
      code: 'timeout',
    });
  });

  it('aborts the provider request on timeout', async () => {
    let signal: AbortSignal | undefined;
    const provider: SearchProvider = {
      search: (_q, _p, s) => {
        signal = s;
        return new Promise(() => {});
      },
    };
    await expect(searchRecipes('slow', 0, { provider, timeoutMs: 20 })).rejects.toThrow();
    expect(signal?.aborted).toBe(true);
  });

  it('wraps unexpected provider failures as upstream errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const provider: SearchProvider = {
      search: jest.fn().mockRejectedValue(new TypeError('fetch failed')),
    };
    await expect(searchRecipes('q', 0, { provider })).rejects.toMatchObject({ code: 'upstream' });
  });
});
