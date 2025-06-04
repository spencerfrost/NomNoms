'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/types';
import { searchRecipes } from '@/lib/recipe-utils';
import { RecipeCard } from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common';
import { useRouter } from 'next/navigation';

interface ClientSearchBarProps {
  readonly recipes: Recipe[];
}

export function ClientSearchBar({ recipes }: ClientSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes);
  const router = useRouter();

  useEffect(() => {
    const filtered = searchRecipes(recipes, searchQuery);
    setFilteredRecipes(filtered);
  }, [recipes, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search recipes, ingredients, or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 border-border"
          />
        </div>
        <Link href="/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Button>
        </Link>
      </div>

      {/* Recipe Count */}
      <div className="text-sm text-muted-foreground">
        {searchQuery
          ? `Found ${filteredRecipes.length} recipe(s) matching "${searchQuery}"`
          : `${recipes.length} recipe(s) total`}
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? 'No recipes found' : 'No recipes yet'}
          description={
            searchQuery
              ? 'Try a different search term or browse all recipes'
              : 'Start building your recipe collection by adding your first recipe'
          }
          action={
            searchQuery
              ? {
                  label: 'Clear Search',
                  onClick: () => setSearchQuery(''),
                  variant: 'secondary' as const,
                }
              : {
                  label: 'Add Your First Recipe',
                  onClick: () => router.push('/add'),
                }
          }
        />
      )}
    </div>
  );
}
