'use client'

import { useInfiniteRecipes } from '@/hooks/useInfiniteRecipes'
import { RecipeCard } from '@/components/recipe-card'
import { InfiniteGrid } from './InfiniteGrid'

interface InfiniteRecipeGridProps {
  search?: string
  tags?: string[]
}

export function InfiniteRecipeGrid({ 
  search, 
  tags
}: InfiniteRecipeGridProps) {
  const { 
    recipes, 
    isLoading, 
    isLoadingMore, 
    hasMore, 
    loadMore,
    error,
    isEmpty
  } = useInfiniteRecipes({ search, tags })

  return (
    <InfiniteGrid
      items={recipes}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore || false}
      hasMore={hasMore}
      loadMore={loadMore}
      error={error}
      isEmpty={isEmpty}
      renderItem={(recipe) => <RecipeCard key={recipe.id} recipe={recipe} />}
      emptyState={{
        title: "No recipes found",
        message: search ? `No recipes match "${search}"` : 'No recipes available'
      }}
      errorState={{
        title: "Failed to load recipes",
        message: "There was an error loading the recipe library. Please refresh the page and try again."
      }}
    />
  )
}