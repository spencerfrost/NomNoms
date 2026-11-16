/** Shapes and helpers shared by the search route and the Discover page. Client-safe. */

export const SEARCH_QUERY_MAX_LENGTH = 200;

/** The user's text plus "recipe", unless they already said it. */
export function buildSearchQuery(text: string): string {
  const query = text.trim().replace(/\s+/g, ' ');
  return /\brecipes?\b/i.test(query) ? query : `${query} recipe`;
}

export interface RecipeSearchResult {
  title: string;
  url: string;
  /** Display name of the site, e.g. "Serious Eats" or "seriouseats.com". */
  site: string;
  snippet: string;
  thumbnail: string | null;
}

export interface AnnotatedSearchResult extends RecipeSearchResult {
  /** Slug of the viewer's recipe already saved from this URL, if any. */
  savedSlug: string | null;
}

export interface RecipeSearchResponse {
  results: AnnotatedSearchResult[];
  page: number;
  hasMore: boolean;
}
