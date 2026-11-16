import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { RATE_LIMITS, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import {
  RecipeSearchError,
  SEARCH_MAX_PAGE,
  SEARCH_QUERY_MAX_LENGTH,
  isSearchConfigured,
  searchRecipes,
  type RecipeSearchErrorCode,
} from '@/lib/recipe-search';
import { findSavedSlugsBySourceUrl } from '@/lib/recipes-db';
import type { RecipeSearchResponse } from '@/lib/recipe-search-types';

const STATUS_BY_CODE: Record<RecipeSearchErrorCode, number> = {
  not_configured: 503,
  timeout: 504,
  upstream: 502,
  bad_response: 502,
};

function searchError(error: RecipeSearchError): NextResponse {
  return NextResponse.json(
    { error: error.message, code: error.code },
    { status: STATUS_BY_CODE[error.code] }
  );
}

// GET /api/discover/search?q=&page=  (page is zero-based)
// Middleware doesn't cover this path, so the session check here is the only one.
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q')?.trim() ?? '';
  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }
  if (query.length > SEARCH_QUERY_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Search query must be at most ${SEARCH_QUERY_MAX_LENGTH} characters` },
      { status: 400 }
    );
  }
  const rawPage = searchParams.get('page') ?? '0';
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : NaN;
  if (!Number.isInteger(page) || page > SEARCH_MAX_PAGE) {
    return NextResponse.json(
      { error: `page must be an integer from 0 to ${SEARCH_MAX_PAGE}` },
      { status: 400 }
    );
  }

  // Checked before rate limiting so a misconfigured server doesn't burn the user's quota.
  if (!isSearchConfigured()) {
    return searchError(new RecipeSearchError('not_configured'));
  }

  const limited = await rateLimit(`search:${userId}`, RATE_LIMITS.recipeSearch);
  if (!limited.allowed) {
    return tooManyRequests(limited, 'Too many searches. Please wait a few minutes and try again.');
  }

  let found;
  try {
    found = await searchRecipes(query, page);
  } catch (error) {
    if (error instanceof RecipeSearchError) {
      if (error.code !== 'timeout') {
        console.error(`Recipe search failed (${error.code}, status ${error.status ?? 'n/a'})`);
      }
      return searchError(error);
    }
    console.error('Recipe search error:', error);
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 });
  }

  // "Saved" markers are a convenience: if the lookup fails, return results without them.
  let saved = new Map<string, string>();
  try {
    saved = await findSavedSlugsBySourceUrl(
      userId,
      found.results.map(r => r.url)
    );
  } catch (error) {
    console.error('Saved-recipe lookup failed:', error);
  }

  const body: RecipeSearchResponse = {
    results: found.results.map(r => ({ ...r, savedSlug: saved.get(r.url) ?? null })),
    page,
    hasMore: found.hasMore,
  };
  return NextResponse.json(body);
}
