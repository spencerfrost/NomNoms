import { NextRequest, NextResponse } from 'next/server'
import { getRecipeBySlug } from '@/lib/server-recipes'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const recipe = await getRecipeBySlug(slug)
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(recipe)
  } catch (error) {
    console.error(`Error fetching recipe ${params.slug}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    )
  }
}