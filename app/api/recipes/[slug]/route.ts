import { NextRequest, NextResponse } from 'next/server';
import { getRecipeBySlug, updateRecipe, deleteRecipe } from '@/lib/recipes-db';
import { parseRecipeUpdate } from '@/lib/recipe-schema';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const recipe = await getRecipeBySlug(slug, session?.user?.id);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error(`Error fetching recipe:`, error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = parseRecipeUpdate(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const updatedRecipe = await updateRecipe(slug, parsed.data, session.user.id);

    if (!updatedRecipe) {
      return NextResponse.json({ error: 'Recipe not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error(`Error updating recipe:`, error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const success = await deleteRecipe(slug, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'Recipe not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting recipe:`, error);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
}
