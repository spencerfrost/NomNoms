import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isValidRecipeUrl, transformScrapedRecipe, getImportErrorMessage } from '@/lib/recipe-import-utils';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidRecipeUrl(url)) {
      return NextResponse.json(
        { error: 'Please enter a valid recipe URL' },
        { status: 400 }
      );
    }

    // Dynamic import of recipe-scraper to avoid issues
    const recipeScraper = (await import('recipe-scraper')).default;
    
    // Scrape the recipe
    let scrapedData;
    try {
      scrapedData = await recipeScraper(url);
    } catch (error) {
      console.error('Recipe scraping error:', error);
      return NextResponse.json(
        { error: getImportErrorMessage(error) },
        { status: 400 }
      );
    }

    // Validate scraped data
    if (!scrapedData || !scrapedData.name) {
      return NextResponse.json(
        { error: 'No recipe was found at this URL. Please check the link and try again.' },
        { status: 400 }
      );
    }

    // Transform to NomNoms format
    const transformedRecipe = transformScrapedRecipe(scrapedData, url);

    return NextResponse.json(transformedRecipe);
  } catch (error) {
    console.error('Recipe import error:', error);
    return NextResponse.json(
      { error: getImportErrorMessage(error) },
      { status: 500 }
    );
  }
}
