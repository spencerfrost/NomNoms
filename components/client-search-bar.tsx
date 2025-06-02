"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/lib/types";
import { searchRecipes } from "@/lib/recipe-utils";
import { RecipeCard } from "@/components/recipe-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

interface ClientSearchBarProps {
  readonly recipes: Recipe[];
}

export function ClientSearchBar({ recipes }: ClientSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes);

  useEffect(() => {
    const filtered = searchRecipes(recipes, searchQuery);
    setFilteredRecipes(filtered);
  }, [recipes, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search recipes, ingredients, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
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
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? "No recipes found" : "No recipes yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term or browse all recipes"
              : "Start building your recipe collection by adding your first recipe"}
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery("")}>
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
  );
}
