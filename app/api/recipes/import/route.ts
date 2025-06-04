import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { scrapeRecipeFromUrl } from '@/lib/recipe-import-utils';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.info('Importing recipe from URL:', url);

    // Use our custom scraping function with JSON-LD parsing
    const recipe = await scrapeRecipeFromUrl(url);

    console.info('Successfully scraped recipe:', recipe.name);

    // Return the scraped recipe data
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Import error:', error);

    // Determine appropriate status code based on error
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes('Invalid URL format')) {
        statusCode = 400;
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        statusCode = 404;
      } else if (error.message.includes('timeout')) {
        statusCode = 408;
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        statusCode = 403;
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import recipe' },
      { status: statusCode }
    );
  }
}
