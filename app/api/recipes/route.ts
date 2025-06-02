import { NextRequest, NextResponse } from 'next/server'
import { getAllRecipes, saveRecipe } from '@/lib/server-recipes'
import { Recipe } from '@/lib/types'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const recipes = await getAllRecipes()
    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to add recipes' },
        { status: 401 }
      )
    }

    const recipe: Recipe = await request.json()
    
    // Validate required fields
    if (!recipe.title || !recipe.description || !recipe.ingredients || !recipe.instructions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const slug = await saveRecipe(recipe)
    
    return NextResponse.json(
      { message: 'Recipe saved successfully', slug },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving recipe:', error)
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    )
  }
}