'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Recipe, getRecipeIngredients } from '@/types';
import { getRecipeBySlug } from '@/lib/client-recipes';
import {
  RecipeHeader,
  RecipeImage,
  RecipeIngredientsList,
  RecipeInstructionsList,
  RecipeLayout,
} from '@/components/recipe/display';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/page-header';
import { LoadingSpinner, NotFound } from '@/components/common';
import { useSession } from 'next-auth/react';

export default function RecipePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current user can edit this recipe
  const canEdit = session?.user?.id && recipe?.authorId === session.user.id;

  useEffect(() => {
    async function loadRecipe() {
      try {
        const recipeData = await getRecipeBySlug(slug);
        if (recipeData) {
          setRecipe(recipeData);
        } else {
          setError('Recipe not found');
        }
      } catch (err) {
        console.error('Error loading recipe:', err);
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadRecipe();
    }
  }, [slug]);

  if (loading) {
    return <LoadingSpinner text="Loading recipe..." size="large" fullScreen />;
  }

  if (error || !recipe) {
    return (
      <NotFound
        title="Recipe Not Found"
        message={error || "The recipe you're looking for doesn't exist."}
        backButtonText="Back to Recipes"
        backButtonUrl="/"
      />
    );
  }

  return (
    <RecipeLayout>
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between w-full mb-4">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>

          {canEdit && (
            <Link href={`/recipes/${slug}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Recipe
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecipeHeader
            title={recipe.title}
            description={recipe.description || undefined}
            tags={recipe.tags}
            yield={recipe.yield || undefined}
            prepTime={recipe.prepTime || undefined}
            cookTime={recipe.cookTime || undefined}
            multiplier={multiplier}
          />
        </div>

        <div className="lg:col-span-1">
          <RecipeImage
            src={recipe.image || undefined}
            alt={recipe.title}
            title={recipe.title}
            size="large"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ingredients + Scale Controls */}
        <div className="lg:col-span-1">
          <RecipeIngredientsList
            ingredients={getRecipeIngredients(recipe)}
            multiplier={multiplier}
            onMultiplierChange={setMultiplier}
          />
        </div>

        {/* Right Column: Instructions */}
        <div className="lg:col-span-2">
          <RecipeInstructionsList instructions={recipe.instructions} />
        </div>
      </div>
    </RecipeLayout>
  );
}
