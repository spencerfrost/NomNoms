'use client';

import { useState, type ReactNode } from 'react';
import type { Ingredient } from '@/types';
import { ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CookMode } from './CookMode';
import { RecipeHeader } from './RecipeHeader';
import { RecipeIngredientsList } from './RecipeIngredientsList';

interface ScalableRecipeProps {
  title: string;
  description?: string;
  tags: string[];
  yield?: string;
  prepTime?: string;
  cookTime?: string;
  ingredients: Ingredient[];
  /** Raw step text, for the step-by-step cooking view. */
  steps: string[];
  /** Server-rendered pieces that don't depend on the multiplier. */
  image: ReactNode;
  instructions: ReactNode;
}

/**
 * The interactive part of the recipe page: owns the scale multiplier and renders the
 * pieces that change with it (yield and ingredient amounts), plus the full-screen
 * cooking view. Everything else is rendered on the server and passed in as slots.
 */
export function ScalableRecipe({
  ingredients,
  steps,
  image,
  instructions,
  ...header
}: ScalableRecipeProps) {
  const [multiplier, setMultiplier] = useState(1);
  const [cooking, setCooking] = useState(false);

  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="order-last lg:order-none lg:col-span-2">
          <RecipeHeader {...header} multiplier={multiplier} />
        </div>
        <div className="lg:col-span-1">{image}</div>
      </div>

      {steps.length > 0 && (
        <Button size="lg" onClick={() => setCooking(true)} className="mb-5 w-full md:w-auto">
          <ChefHat className="size-5" />
          Start cooking
        </Button>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-1">
          <RecipeIngredientsList
            ingredients={ingredients}
            multiplier={multiplier}
            onMultiplierChange={setMultiplier}
          />
        </div>
        <div className="lg:col-span-2">{instructions}</div>
      </div>

      {cooking && (
        <CookMode
          title={header.title}
          steps={steps}
          ingredients={ingredients}
          multiplier={multiplier}
          onClose={() => setCooking(false)}
        />
      )}
    </>
  );
}
