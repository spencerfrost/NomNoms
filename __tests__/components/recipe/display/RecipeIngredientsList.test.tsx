import { render, screen } from '@testing-library/react';
import { RecipeIngredientsList } from '@/components/recipe/display/RecipeIngredientsList';

describe('RecipeIngredientsList', () => {
  it('scales both ends of a range', () => {
    render(
      <RecipeIngredientsList
        ingredients={[
          { amount: 2, amountMax: 3, unit: 'Tbsp', name: 'olive oil' },
          { amount: 1, unit: 'cup', name: 'rice' },
          { amount: 0, unit: '', name: 'salt to taste' },
        ]}
        multiplier={2}
        showScaleControls={false}
      />
    );
    expect(screen.getByText('4–6 Tbsp')).toBeInTheDocument();
    expect(screen.getByText('2 cup')).toBeInTheDocument();
    expect(screen.getByText('salt to taste')).toBeInTheDocument();
  });
});
