import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { ArrowLeft, Edit } from 'lucide-react';
import { authOptions } from '@/lib/auth-config';
import { getRecipeBySlug } from '@/lib/recipes-db';
import { getRecipeIngredients } from '@/types';
import {
  RecipeImage,
  RecipeInstructionsList,
  RecipeLayout,
  ScalableRecipe,
} from '@/components/recipe/display';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/page-header';

type Props = { params: Promise<{ slug: string }> };

const DESCRIPTION_LIMIT = 160;

// Shared by generateMetadata and the page so one request does one session lookup and
// one query. Reading the session makes this route dynamic, which it must be: whether a
// private recipe is visible depends on who is asking.
const loadRecipe = cache(async (slug: string) => {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id;
  const recipe = await getRecipeBySlug(slug, viewerId);
  return { recipe, viewerId };
});

function summarize(text: string): string | undefined {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (!flat) return undefined;
  return flat.length > DESCRIPTION_LIMIT
    ? `${flat.slice(0, DESCRIPTION_LIMIT - 1).trimEnd()}…`
    : flat;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { recipe } = await loadRecipe(slug);

  if (!recipe) {
    return { title: 'Recipe not found', robots: { index: false } };
  }

  const description = summarize(recipe.description);
  return {
    title: recipe.title,
    description,
    openGraph: {
      type: 'article',
      title: recipe.title,
      description,
      images: recipe.image ? [{ url: recipe.image, alt: recipe.title }] : undefined,
    },
    // Only the author can load a private recipe, but keep it out of indexes regardless.
    robots: recipe.visibility === 'private' ? { index: false, follow: false } : undefined,
  };
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const { recipe, viewerId } = await loadRecipe(slug);

  if (!recipe) {
    notFound();
  }

  const canEdit = viewerId !== undefined && recipe.authorId === viewerId;

  return (
    <RecipeLayout>
      <PageHeader>
        <div className="flex items-center justify-between w-full mb-4">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>

          {canEdit && (
            <Link href={`/recipes/${encodeURIComponent(recipe.slug)}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Recipe
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      <ScalableRecipe
        title={recipe.title}
        description={recipe.description || undefined}
        tags={recipe.tags}
        yield={recipe.yield || undefined}
        prepTime={recipe.prepTime || undefined}
        cookTime={recipe.cookTime || undefined}
        ingredients={getRecipeIngredients(recipe)}
        image={
          <RecipeImage
            src={recipe.image || undefined}
            alt={recipe.title}
            title={recipe.title}
            size="large"
          />
        }
        instructions={<RecipeInstructionsList instructions={recipe.instructions} />}
      />
    </RecipeLayout>
  );
}
