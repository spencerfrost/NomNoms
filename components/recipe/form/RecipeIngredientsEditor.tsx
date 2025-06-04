'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Ingredient } from '@/types';

interface RecipeIngredientsEditorProps {
  ingredients: Ingredient[];
  onChange: (index: number, field: keyof Ingredient, value: string | number) => void;
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
            <div key={index} className="flex gap-2 items-start">
              <Input
                type="number"
                step="0.01"
                value={ingredient.amount || ''}
                onChange={e => onChange(index, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="Amount"
                className="w-24"
              />
              <Input
                value={ingredient.unit}
                onChange={e => onChange(index, 'unit', e.target.value)}
                placeholder="Unit"
                className="w-20"
              />
              <Input
                value={ingredient.name}
                onChange={e => onChange(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="flex-1"
              />
              {ingredients.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="text-destructive hover:text-destructive"
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
