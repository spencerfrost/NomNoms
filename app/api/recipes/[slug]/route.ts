import { NextRequest, NextResponse } from 'next/server';
import { getRecipeBySlug, updateRecipe, deleteRecipe } from '@/lib/recipes-db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const recipe = await getRecipeBySlug(slug);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error(`Error fetching recipe:`, error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const updates = await request.json();

    // Validate required fields if provided
    if (updates.title !== undefined && !updates.title.trim()) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    }

    const updatedRecipe = await updateRecipe(slug, updates, session.user.id);

    if (!updatedRecipe) {
      return NextResponse.json({ error: 'Recipe not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error(`Error updating recipe:`, error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
