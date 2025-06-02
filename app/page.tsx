import { getAllRecipes } from '@/lib/recipes'
import { ClientSearchBar } from '@/components/client-search-bar'
import { Button } from '@/components/ui/button'
import AuthButton from '@/components/auth-button'
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
          
          <div className="flex items-center gap-4">
            <AuthButton />
            <Link href="/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Recipe Grid */}
        <ClientSearchBar recipes={recipes} />
      </div>
    </div>
  )
}