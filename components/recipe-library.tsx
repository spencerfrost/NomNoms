'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { SearchBar } from '@/components/search-bar'
import { InfiniteRecipeGrid } from '@/components/common/infinite'
import { useDebounce } from '@/hooks/useDebounce'

export function RecipeLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Search Input */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search recipes, ingredients, or tags..."
          className="flex-1"
        />
        
        {/* Add Recipe Button */}
        <Link href="/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Button>
        </Link>
      </div>

      {/* Search indicator */}
      {debouncedSearchQuery && (
        <div className="text-sm text-muted-foreground">
          Searching for &ldquo;{debouncedSearchQuery}&rdquo;...
        </div>
      )}

      {/* Recipe Grid with Infinite Scroll */}
      <InfiniteRecipeGrid search={debouncedSearchQuery || undefined} />
    </div>
  )
}
