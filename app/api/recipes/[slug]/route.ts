import { NextRequest, NextResponse } from 'next/server'
import { getRecipeBySlug } from '@/lib/server-recipes'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Implement recipe update logic
    return NextResponse.json(
      { error: 'Update functionality not implemented yet' },
      { status: 501 }
    )
  } catch (error) {
    console.error(`Error updating recipe ${params.slug}:`, error)
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Implement recipe deletion logic
    return NextResponse.json(
      { error: 'Delete functionality not implemented yet' },
      { status: 501 }
    )
  } catch (error) {
    console.error(`Error deleting recipe ${params.slug}:`, error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}