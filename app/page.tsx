import { RecipeLibrary } from '@/components/recipe-library';
import PageHeader from '@/components/page-header';

export default async function HomePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 pt-10 pb-8 md:pt-8">
      <PageHeader>
        <h1 className="text-5xl md:text-7xl">NomNoms</h1>
      </PageHeader>

      <RecipeLibrary />
    </div>
  );
}
