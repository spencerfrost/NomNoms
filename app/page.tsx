import { getAllRecipes } from "@/lib/recipes-db";
import { ClientSearchBar } from "@/components/client-search-bar";
import PageHeader from "@/components/page-header";

// Server Component for better SSR performance
export default async function HomePage() {
  const recipes = await getAllRecipes();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <PageHeader>
        <div>
          <h1 className="text-4xl font-bold mb-2">Recipe Collection</h1>
          <p className="text-muted-foreground">
            Discover and manage your favorite recipes
          </p>
        </div>
      </PageHeader>

      {/* Search and Recipe Grid */}
      <ClientSearchBar recipes={recipes} />
    </div>
  );
}
