import type { Recipe } from '@/types';
import type { RecipeCreatePayload, RecipeUpdatePayload } from '@/lib/recipe-schema';


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
