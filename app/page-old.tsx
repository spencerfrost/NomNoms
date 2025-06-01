'use client'

import { useState, useEffect } from 'react'
import { Recipe } from '@/lib/types'
import { getAllRecipes, searchRecipes } from '@/lib/client-recipes'
import { RecipeCard } from '@/components/recipe-card'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecipes() {
      try {
        const allRecipes = await getAllRecipes()
        setRecipes(allRecipes)
        setFilteredRecipes(allRecipes)
      } catch (error) {
        console.error('Failed to load recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [])

  useEffect(() => {
    const filtered = searchRecipes(recipes, searchQuery)
    setFilteredRecipes(filtered)
  }, [recipes, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading recipes...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your delicious recipes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary">🍽️ NomNoms</h1>
            <p className="text-muted-foreground mt-1">Your personal recipe collection</p>
          </div>
          <Link href="/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search recipes, ingredients, or tags..."
          />
        </div>

        {/* Recipe Count */}
        <div className="text-sm text-muted-foreground">
          {searchQuery ? `Found ${filteredRecipes.length} recipe(s) matching "${searchQuery}"` : `${recipes.length} recipe(s) total`}
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No recipes found' : 'No recipes yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try a different search term or browse all recipes' 
                : 'Start building your recipe collection by adding your first recipe'
              }
            </p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            ) : (
              <Link href="/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Recipe
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
