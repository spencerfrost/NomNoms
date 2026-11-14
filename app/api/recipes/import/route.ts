import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import {
  RecipeImportError,
  scrapeRecipeFromUrl,
  type RecipeImportErrorCode,
} from '@/lib/recipe-import-utils';
import { RATE_LIMITS, rateLimit, tooManyRequests } from '@/lib/rate-limit';

// 4xx: the URL or page is the problem, so retrying won't help.
// 5xx: the upstream site failed (502) or timed out (504); a retry might work.
const STATUS_BY_CODE: Record<RecipeImportErrorCode, number> = {
  invalid_url: 400,
  unreachable: 422,
  not_found: 422,
  no_recipe: 422,
  blocked: 502,
  fetch_failed: 502,
  timeout: 504,
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const url = (body as { url?: unknown } | null)?.url;
  if (typeof url !== 'string' || !url.trim()) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const limited = await rateLimit(`import:${session.user.id}`, RATE_LIMITS.recipeImport);
  if (!limited.allowed) {
    return tooManyRequests(limited, 'Too many imports. Please wait a few minutes and try again.');
  }

  try {
    const recipe = await scrapeRecipeFromUrl(url.trim());
    return NextResponse.json(recipe);
  } catch (error) {
    if (error instanceof RecipeImportError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: STATUS_BY_CODE[error.code] }
      );
    }
    // Unexpected failure: don't echo internal error text to the client.
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Unable to import recipe. Please try again or add the recipe manually.' },
      { status: 500 }
    );
  }
}
