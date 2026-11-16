import { Ingredient } from '@/types/recipe';
import { ScaleControls } from '@/components/scale-controls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAmountRange } from '@/lib/amount-utils';

interface RecipeIngredientsListProps {
  ingredients: Ingredient[];
  multiplier: number;
  showScaleControls?: boolean;
  onMultiplierChange?: (multiplier: number) => void;
}

export function RecipeIngredientsList({
  ingredients,
  multiplier,
  showScaleControls = true,
  onMultiplierChange,
}: RecipeIngredientsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredients</CardTitle>
      </CardHeader>
      <CardContent>
        {showScaleControls && onMultiplierChange && (
          <div className="mb-4">
            <ScaleControls multiplier={multiplier} onMultiplierChange={onMultiplierChange} />
          </div>
        )}

        <ul>
          {ingredients.map((ingredient, index) => {
            // Scaled amount or range ("2–3"). Ingredients without an amount (e.g. "salt to
            // taste") show only the unit, if any.
            const formattedAmount = formatAmountRange(ingredient, multiplier);
            const displayText = [formattedAmount, ingredient.unit].filter(Boolean).join(' ');

            return (
              <li key={`${index}-${ingredient.name}`} className="border-t-2 border-background">
                {/* The checkbox is only a "got it" tick while gathering; it isn't saved. */}
                <label className="flex min-h-12 cursor-pointer items-center gap-3 py-2 text-lg leading-snug">
                  <input type="checkbox" className="peer size-6 shrink-0 accent-primary" />
                  <span className="w-24 shrink-0 font-bold peer-checked:text-muted-foreground peer-checked:line-through">
                    {displayText}
                  </span>
                  <span className="font-medium peer-checked:text-muted-foreground peer-checked:line-through">
                    {ingredient.name}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
