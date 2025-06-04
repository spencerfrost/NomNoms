import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '24')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    // Build where clause
    const whereClause = {
      AND: [
        // Search filter
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {},
        // Tags filter
        tags?.length ? { tags: { hasSome: tags } } : {},
        // Only public recipes for now (can add user filtering later)
        { visibility: 'public' }
      ]
    }

    const recipes = await prisma.recipe.findMany({
      where: whereClause,
      take: limit + 1, // Take one extra to check if there's more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1 // Skip the cursor
      }),
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' } // Stable sort
      ],
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    })

    const hasMore = recipes.length > limit
    const recipesToReturn = hasMore ? recipes.slice(0, -1) : recipes
    const nextCursor = hasMore ? recipes[recipes.length - 2].id : null

    return NextResponse.json({
      recipes: recipesToReturn,
      nextCursor,
      hasMore
    })
  } catch (error) {
    console.error('Error fetching infinite recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}
