import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes, createRecipe } from '@/lib/recipes-db';
import { parseRecipeCreate } from '@/lib/recipe-schema';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const recipes = await getAllRecipes(session?.user?.id);
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to add recipes' },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = parseRecipeCreate(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const newRecipe = await createRecipe(parsed.data, session.user.id);

    return NextResponse.json(
      { message: 'Recipe saved successfully', slug: newRecipe.slug },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
  }
}
