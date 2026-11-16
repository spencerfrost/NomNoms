/**
 * Recipe web search for /discover. Server-only (reads the API key).
 *
 * The provider sits behind `SearchProvider` so it can be swapped (e.g. for Google
 * Programmable Search) without touching the route or UI. The default is the Brave Search
 * API. Its host is fixed, not user-supplied, so this doesn't go through safe-fetch's SSRF
 * checks; it still has a timeout.
 */
import { env } from './env';
import { buildSearchQuery, type RecipeSearchResult } from './recipe-search-types';

export type { RecipeSearchResult } from './recipe-search-types';
export { buildSearchQuery, SEARCH_QUERY_MAX_LENGTH } from './recipe-search-types';

export type RecipeSearchErrorCode =
  | 'not_configured' // no BRAVE_SEARCH_API_KEY
  | 'timeout'
  | 'upstream' // provider answered with an error status or the request failed
  | 'bad_response'; // provider answered 200 with something we can't read

const SEARCH_ERROR_MESSAGES: Record<RecipeSearchErrorCode, string> = {
  not_configured: 'Recipe search is not set up on this server.',
  timeout: 'The search took too long. Please try again.',
  upstream: 'The search service is unavailable right now. Please try again later.',
  bad_response: 'The search service returned an unexpected response. Please try again later.',
};

export class RecipeSearchError extends Error {
  constructor(
    public readonly code: RecipeSearchErrorCode,
    message: string = SEARCH_ERROR_MESSAGES[code],
    /** Upstream HTTP status, for logs only. */
    public readonly status?: number
  ) {
    super(message);
    this.name = 'RecipeSearchError';
  }
}

export interface SearchPage {
  results: RecipeSearchResult[];
  hasMore: boolean;
}

export interface SearchProvider {
  /** `page` is zero-based. Throws RecipeSearchError for provider failures. */
  search(query: string, page: number, signal: AbortSignal): Promise<SearchPage>;
}

export const SEARCH_TIMEOUT_MS = 8_000;
export const SEARCH_PAGE_SIZE = 20;
/** Brave's `offset` (a page index) tops out at 9. */
export const SEARCH_MAX_PAGE = 9;

// --- Brave -----------------------------------------------------------------------------

const BRAVE_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Brave snippets carry <strong> highlights and HTML entities; we render plain text. */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
      if (entity[0] === '#') {
        const code =
          entity[1]?.toLowerCase() === 'x'
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : match;
      }
      return ENTITIES[entity.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function httpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

/** Maps a Brave web search response. Skips unusable items rather than failing the page. */
export function mapBraveResponse(json: unknown, page: number): SearchPage {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    throw new RecipeSearchError('bad_response');
  }
  const body = obj(json);
  // Brave omits `web` entirely when nothing matched.
  const rawResults = obj(body.web).results;
  const items = Array.isArray(rawResults) ? rawResults : [];

  const results: RecipeSearchResult[] = [];
  for (const item of items) {
    const entry = obj(item);
    const url = httpUrl(entry.url);
    if (!url) continue;
    const host = new URL(url).hostname.replace(/^www\./, '');
    const thumbnail = obj(entry.thumbnail);
    results.push({
      title: toPlainText(str(entry.title)) || host,
      url,
      site: toPlainText(str(obj(entry.profile).name)) || host,
      snippet: toPlainText(str(entry.description)),
      thumbnail: httpUrl(thumbnail.src) ?? httpUrl(thumbnail.original),
    });
  }

  const more = obj(body.query).more_results_available === true;
  return { results, hasMore: more && page < SEARCH_MAX_PAGE };
}

export function createBraveProvider(apiKey: string, fetchImpl: typeof fetch = fetch): SearchProvider {
  return {
    async search(query, page, signal) {
      const params = new URLSearchParams({
        q: query,
        count: String(SEARCH_PAGE_SIZE),
        offset: String(page),
        result_filter: 'web',
      });
      const response = await fetchImpl(`${BRAVE_ENDPOINT}?${params}`, {
        headers: { Accept: 'application/json', 'X-Subscription-Token': apiKey },
        signal,
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new RecipeSearchError('upstream', undefined, response.status);
      }
      let json: unknown;
      try {
        json = await response.json();
      } catch {
        throw new RecipeSearchError('bad_response');
      }
      return mapBraveResponse(json, page);
    },
  };
}

// --- Entry point -----------------------------------------------------------------------

export function isSearchConfigured(): boolean {
  return Boolean(env.BRAVE_SEARCH_API_KEY);
}

function defaultProvider(): SearchProvider | null {
  return env.BRAVE_SEARCH_API_KEY ? createBraveProvider(env.BRAVE_SEARCH_API_KEY) : null;
}

export interface SearchOptions {
  provider?: SearchProvider | null;
  timeoutMs?: number;
}

/**
 * Searches the web for recipes matching `text`. Always throws RecipeSearchError on
 * failure, so the route can pick a status from `code`.
 */
export async function searchRecipes(
  text: string,
  page = 0,
  { provider = defaultProvider(), timeoutMs = SEARCH_TIMEOUT_MS }: SearchOptions = {}
): Promise<SearchPage> {
  if (!provider) throw new RecipeSearchError('not_configured');

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Race as well as abort, so a provider that ignores the signal still can't hang us.
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new RecipeSearchError('timeout'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      provider.search(buildSearchQuery(text), page, controller.signal),
      timeout,
    ]);
  } catch (error) {
    if (error instanceof RecipeSearchError) throw error;
    if (controller.signal.aborted) throw new RecipeSearchError('timeout');
    // Network errors and the like. Log the cause; callers only see the code.
    console.error('Recipe search failed:', error);
    throw new RecipeSearchError('upstream');
  } finally {
    clearTimeout(timer);
  }
}
