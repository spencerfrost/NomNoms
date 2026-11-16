'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Ingredient } from '@/types';
import { withAmount } from '@/lib/amount-utils';
import { AmountInput } from './AmountInput';

interface RecipeIngredientsEditorProps {
  ingredients: Ingredient[];
  /** Called with the whole updated ingredient. */
  onChange: (index: number, ingredient: Ingredient) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

/**
 * Component for managing recipe ingredients with dynamic add/remove functionality
 */
export default function RecipeIngredientsEditor({
  ingredients,
  onChange,
  onAdd,
  onRemove,
}: RecipeIngredientsEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredients</CardTitle>
        <CardDescription>List all the ingredients needed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-1.5 sm:gap-2">
              <AmountInput
                value={ingredient}
                onChange={amount => onChange(index, withAmount(ingredient, amount))}
                className="w-20 shrink-0 px-3 sm:w-24"
              />
              <Input
                value={ingredient.unit}
                onChange={e => onChange(index, { ...ingredient, unit: e.target.value })}
                placeholder="Unit"
                className="w-16 shrink-0 px-3 sm:w-20"
              />
              <Input
                value={ingredient.name}
                onChange={e => onChange(index, { ...ingredient, name: e.target.value })}
                placeholder="Ingredient name"
                className="min-w-0 flex-1"
              />
              {ingredients.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ingredient ${index + 1}`}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button type="button" onClick={onAdd} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
