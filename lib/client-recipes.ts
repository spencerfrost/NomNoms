import type { Recipe } from '@/types';
import type { RecipeCreatePayload, RecipeUpdatePayload } from '@/lib/recipe-schema';
import type { ImportedRecipe } from '@/lib/recipe-import-utils';
import type { RecipeSearchResponse } from '@/lib/recipe-search-types';

/** A failed API call, carrying the server's user-facing message and error code. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiError(response: Response, fallback: string): Promise<ApiError> {
  const data = (await response.json().catch(() => null)) as { error?: unknown; code?: unknown } | null;
  return new ApiError(
    typeof data?.error === 'string' ? data.error : fallback,
    response.status,
    typeof data?.code === 'string' ? data.code : undefined
  );
}

/** Parses a recipe page on the server. Saves nothing. */
export async function importRecipe(url: string): Promise<ImportedRecipe> {
  const response = await fetch('/api/recipes/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) throw await apiError(response, 'Failed to import recipe');
  return response.json();
}

export async function searchRecipes(query: string, page = 0): Promise<RecipeSearchResponse> {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const response = await fetch(`/api/discover/search?${params}`);
  if (!response.ok) throw await apiError(response, 'Search failed');
  return response.json();
}


/**
 * Returns null only when the API says the recipe doesn't exist (404). Any other failure
 * throws, so callers can show "failed to load" instead of "not found".
 */
export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const response = await fetch(`/api/recipes/${encodeURIComponent(slug)}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch recipe (${response.status})`);
  }
  return response.json();
}

export async function saveRecipe(recipeData: RecipeCreatePayload): Promise<string> {
  try {
    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save recipe');
    }

    const result = await response.json();
    return result.slug;
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
}

export async function updateRecipe(
  slug: string,
  recipeData: RecipeUpdatePayload
): Promise<string> {
  try {
    const response = await fetch(`/api/recipes/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update recipe');
    }

    const result = await response.json();
    return result.slug;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
}
