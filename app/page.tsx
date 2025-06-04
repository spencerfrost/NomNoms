import { RecipeLibrary } from '@/components/recipe-library';
import PageHeader from '@/components/page-header';
import Logo from '@/components/ui/logo';

export default async function HomePage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <PageHeader>
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Logo size="xl" />
            <h1 className="text-4xl">NomNoms</h1>
          </div>
          <p className="text-muted-foreground">Discover and manage your favorite recipes</p>
        </div>
      </PageHeader>

      <RecipeLibrary />
    </div>
  );
}
