'use client';

import { useState, type ReactNode } from 'react';
import type { Ingredient } from '@/types';
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
  /** Server-rendered pieces that don't depend on the multiplier. */
  image: ReactNode;
  instructions: ReactNode;
}

/**
 * The interactive part of the recipe page: owns the scale multiplier and renders the
 * pieces that change with it (yield and ingredient amounts). Everything else is
 * rendered on the server and passed in as slots.
 */
export function ScalableRecipe({ ingredients, image, instructions, ...header }: ScalableRecipeProps) {
  const [multiplier, setMultiplier] = useState(1);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecipeHeader {...header} multiplier={multiplier} />
        </div>
        <div className="lg:col-span-1">{image}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RecipeIngredientsList
            ingredients={ingredients}
            multiplier={multiplier}
            onMultiplierChange={setMultiplier}
          />
        </div>
        <div className="lg:col-span-2">{instructions}</div>
      </div>
    </>
  );
}
