export interface Ingredient {
  amount: number;
  unit: string;
  name: string;
}

export interface Recipe {
  slug: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  yield: string;
  image?: string;
  prepTime?: string;
  cookTime?: string;
}