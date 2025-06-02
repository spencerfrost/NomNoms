// Database-based recipe utilities - replaces server-recipes.ts
import { prisma } from './prisma'
import { Recipe } from './types'

// Re-export types for convenience
export type { Recipe, Ingredient } from './types'

export async function getAllRecipes(userId?: string): Promise<Recipe[]> {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        // Show public recipes and user's own recipes if userId provided
        OR: [
          { visibility: 'public' },
          ...(userId ? [{ authorId: userId }] : [])
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { title: 'asc' }
    })
    
    return recipes
  } catch (error) {
    console.error('Error reading recipes from database:', error)
    return []
  }
}

export async function getRecipeBySlug(slug: string, userId?: string): Promise<Recipe | null> {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!recipe) {
      return null
    }
    
    // Check visibility permissions
    if (recipe.visibility === 'private' && recipe.authorId !== userId) {
      return null // User doesn't have permission to view this recipe
    }
    
    return recipe
  } catch (error) {
    console.error(`Error reading recipe ${slug} from database:`, error)
    return null
  }
}

export async function createRecipe(recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'author'>, authorId: string): Promise<Recipe> {
  try {
    // Generate slug from title if not provided
    const slug = recipeData.slug || recipeData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    // Check if slug already exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug }
    })
    
    if (existingRecipe) {
      throw new Error(`Recipe with slug "${slug}" already exists`)
    }
    
    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        slug,
        authorId,
        visibility: recipeData.visibility || 'public'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return recipe
  } catch (error) {
    console.error('Error creating recipe:', error)
    throw error
  }
}

export async function updateRecipe(slug: string, recipeData: Partial<Recipe>, userId: string): Promise<Recipe | null> {
  try {
    // First, get the current recipe to check ownership
    const currentRecipe = await prisma.recipe.findUnique({
      where: { slug }
    })
    
    if (!currentRecipe) {
      throw new Error('Recipe not found')
    }
    
    // Check if user owns the recipe
    if (currentRecipe.authorId !== userId) {
      throw new Error('You can only edit your own recipes')
    }
    
    // Update the recipe
    const updatedRecipe = await prisma.recipe.update({
      where: { slug },
      data: {
        ...recipeData,
        // Don't allow changing authorId or slug via update
        authorId: undefined,
        slug: undefined,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return updatedRecipe
  } catch (error) {
    console.error('Error updating recipe:', error)
    throw error
  }
}

export async function deleteRecipe(slug: string, userId: string): Promise<boolean> {
  try {
    // First, get the current recipe to check ownership
    const currentRecipe = await prisma.recipe.findUnique({
      where: { slug }
    })
    
    if (!currentRecipe) {
      throw new Error('Recipe not found')
    }
    
    // Check if user owns the recipe
    if (currentRecipe.authorId !== userId) {
      throw new Error('You can only delete your own recipes')
    }
    
    await prisma.recipe.delete({
      where: { slug }
    })
    
    return true
  } catch (error) {
    console.error('Error deleting recipe:', error)
    throw error
  }
}

export async function getUserRecipes(userId: string): Promise<Recipe[]> {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { title: 'asc' }
    })
    
    return recipes
  } catch (error) {
    console.error('Error getting user recipes:', error)
    return []
  }
}

// Pure utility functions (can be used anywhere)
export function scaleRecipe(recipe: Recipe, multiplier: number): Recipe {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map(ingredient => ({
      ...ingredient,
      amount: Math.round((ingredient.amount * multiplier) * 100) / 100
    }))
  }
}

export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query.trim()) return recipes
  
  const lowerQuery = query.toLowerCase()
  return recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(lowerQuery) ||
    recipe.description.toLowerCase().includes(lowerQuery) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(lowerQuery))
  )
}

export function formatAmount(amount: number, unit: string): string {
  if (amount === 0.25) return `¼ ${unit}`
  if (amount === 0.33) return `⅓ ${unit}`
  if (amount === 0.5) return `½ ${unit}`
  if (amount === 0.67) return `⅔ ${unit}`
  if (amount === 0.75) return `¾ ${unit}`
  
  if (amount % 1 === 0) {
    return `${amount} ${unit}`
  }
  
  return `${amount} ${unit}`
}
