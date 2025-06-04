import { Ingredient } from '@/types/recipe';
import { ScaleControls } from '@/components/scale-controls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIngredientAmount } from '@/lib/recipe-utils';

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
        <CardDescription>
          {showScaleControls ? 'Scale the recipe to your needs' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showScaleControls && onMultiplierChange && (
          <div className="mb-6">
            <ScaleControls multiplier={multiplier} onMultiplierChange={onMultiplierChange} />
          </div>
        )}

        <ul className="space-y-2">
          {ingredients.map(ingredient => {
            // Scale the amount and format for display
            const scaledAmount = ingredient.amount * multiplier;
            const formattedAmount = formatIngredientAmount(scaledAmount);
            const displayText = ingredient.unit
              ? `${formattedAmount} ${ingredient.unit}`
              : formattedAmount;

            return (
              <li key={ingredient.name} className="flex justify-between items-start">
                <span className="font-medium">{ingredient.name}</span>
                <span className="text-muted-foreground text-sm ml-2 flex-shrink-0">
                  {displayText}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
