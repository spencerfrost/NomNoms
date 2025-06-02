export interface Ingredient {
  amount: number; // Always store as decimal number for easy scaling
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