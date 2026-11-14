import { NotFound } from '@/components/common';

export default function RecipeNotFound() {
  return (
    <NotFound
      title="Recipe Not Found"
      message="The recipe you're looking for doesn't exist, or it's private."
      backButtonText="Back to Recipes"
      backButtonUrl="/"
    />
  );
}
