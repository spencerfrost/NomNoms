import { Recipe } from '@/lib/types'
import { getAllRecipes } from '@/lib/recipes'
import { RecipeCard } from '@/components/recipe-card'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

// Server Component for better SSR performance
export default async function HomePage() {
  const recipes = await getAllRecipes()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Recipe Collection</h1>
            <p className="text-muted-foreground">Discover and manage your favorite recipes</p>
          </div>
          
          <Link href="/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar recipes={recipes} />
        </div>

        {/* Recipe Grid */}
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No recipes found</h2>
            <p className="text-muted-foreground mb-4">Get started by adding your first recipe</p>
            <Link href="/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Recipe
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
