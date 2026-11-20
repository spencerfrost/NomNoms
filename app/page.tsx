import { RecipeLibrary } from '@/components/recipe-library';
import PageHeader from '@/components/page-header';
import Logo from '@/components/ui/logo';

export default async function HomePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 pt-10 pb-8 md:pt-8">
      <PageHeader>
        <h1 className="flex items-center gap-3 text-5xl md:gap-4 md:text-7xl">
          <Logo className="h-[1em] w-[1em]" />
          NomNoms
        </h1>
      </PageHeader>

      <RecipeLibrary />
    </div>
  );
}
