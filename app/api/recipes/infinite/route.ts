import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, c => `\\${c}`);
}

/**
 * IDs of public recipes whose title, description, any tag, or any ingredient name contains
 * `search` (case-insensitive). Ingredients live in a JSONB column, which Prisma's query API
 * can't substring-search, so this one step is raw SQL.
 */
async function findMatchingRecipeIds(search: string): Promise<string[]> {
  const pattern = `%${escapeLike(search)}%`;
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT r.id FROM recipes r
    WHERE r.visibility = 'public' AND (
      r.title ILIKE ${pattern}
      OR r.description ILIKE ${pattern}
      OR EXISTS (SELECT 1 FROM unnest(r.tags) AS t(tag) WHERE t.tag ILIKE ${pattern})
      OR CASE WHEN jsonb_typeof(r.ingredients) = 'array' THEN EXISTS (
        SELECT 1 FROM jsonb_array_elements(r.ingredients) AS i(item)
        WHERE i.item->>'name' ILIKE ${pattern}
      ) ELSE false END
    )`;
  return rows.map(row => row.id);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const MAX_LIMIT = 50;
    const parsedLimit = parseInt(searchParams.get('limit') || '24', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), MAX_LIMIT) : 24;
    const search = searchParams.get('search')?.trim();
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    const matchingIds = search ? await findMatchingRecipeIds(search) : null;

    // Build where clause
    const whereClause = {
      AND: [
        // Search filter (title, description, tags, ingredient names)
        matchingIds ? { id: { in: matchingIds } } : {},
        // Tags filter
        tags?.length ? { tags: { hasSome: tags } } : {},
        // Only public recipes for now (can add user filtering later)
        { visibility: 'public' },
      ],
    };

    const recipes = await prisma.recipe.findMany({
      where: whereClause,
      take: limit + 1, // Take one extra to check if there's more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor
      }),
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }, // Stable sort
      ],
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    const hasMore = recipes.length > limit;
    const recipesToReturn = hasMore ? recipes.slice(0, -1) : recipes;
    const nextCursor = hasMore ? recipes[recipes.length - 2].id : null;

    return NextResponse.json({
      recipes: recipesToReturn,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching infinite recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
