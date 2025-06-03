import { Recipe, getRecipeIngredients, Ingredient } from '@/lib/types'

// Interface for creating new recipes
interface CreateRecipeData {
  slug?: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  yield?: string;
  prepTime?: string;
  cookTime?: string;
  image?: string;
  visibility?: string;
}

// Client-side functions for recipe management
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch('/api/recipes')
    if (!response.ok) {
      throw new Error('Failed to fetch recipes')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return []
  }
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  try {
    const response = await fetch(`/api/recipes/${slug}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch recipe')
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching recipe ${slug}:`, error)
    return null
  }
}

export async function saveRecipe(recipeData: CreateRecipeData): Promise<string> {
  try {
    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save recipe')
    }
    
    const result = await response.json()
    return result.slug
  } catch (error) {
    console.error('Error saving recipe:', error)
    throw error
  }
}

export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query.trim()) return recipes
  
  const lowerQuery = query.toLowerCase()
  return recipes.filter(recipe => {
    const ingredients = getRecipeIngredients(recipe);
    return (
      recipe.title.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      ingredients.some(ingredient => ingredient.name.toLowerCase().includes(lowerQuery))
    );
  });
}