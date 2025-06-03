'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Globe, Check, X } from 'lucide-react'
import { ImportedRecipe } from '@/lib/recipe-import-utils'
import { Ingredient } from '@/types/recipe'

interface RecipeUrlImportProps {
  onImported: (recipe: ImportedRecipe) => void;
  onCancel: () => void;
}

export default function RecipeUrlImport({ onImported, onCancel }: RecipeUrlImportProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedRecipe, setImportedRecipe] = useState<ImportedRecipe | null>(null)

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Please enter a recipe URL')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import recipe')
      }

      setImportedRecipe(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe')
    } finally {
      setLoading(false)
    }
  }

  const handleUseRecipe = () => {
    if (importedRecipe) {
      onImported(importedRecipe)
    }
  }

  const handleEditIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    if (!importedRecipe) return
    
    const updatedIngredients = importedRecipe.ingredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    )
    
    setImportedRecipe({
      ...importedRecipe,
      ingredients: updatedIngredients
    })
  }

  const formatTime = (minutes: number) => {
    if (minutes === 0) return 'Not specified'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  if (importedRecipe) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <CardTitle>Review Imported Recipe</CardTitle>
          </div>
          <CardDescription>
            Review and edit the imported recipe before saving
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipe Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Recipe Name</label>
            <Input
              value={importedRecipe.name}
              onChange={(e) => setImportedRecipe({ ...importedRecipe, name: e.target.value })}
              placeholder="Recipe name"
            />
          </div>

          {/* Recipe Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prep Time</label>
              <p className="text-sm text-gray-600">{formatTime(importedRecipe.prepTimeMinutes)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cook Time</label>
              <p className="text-sm text-gray-600">{formatTime(importedRecipe.cookTimeMinutes)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Servings</label>
              <Input
                type="number"
                value={importedRecipe.servings}
                onChange={(e) => setImportedRecipe({ 
                  ...importedRecipe, 
                  servings: parseInt(e.target.value) || 1 
                })}
                min="1"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={importedRecipe.description}
              onChange={(e) => setImportedRecipe({ ...importedRecipe, description: e.target.value })}
              placeholder="Recipe description (optional)"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ingredients ({importedRecipe.ingredients.length})
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {importedRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="number"
                    step="0.25"
                    value={ingredient.amount || ''}
                    onChange={(e) => handleEditIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="Amount"
                    className="w-20"
                  />
                  <Input
                    value={ingredient.unit}
                    onChange={(e) => handleEditIngredient(index, 'unit', e.target.value)}
                    placeholder="Unit"
                    className="w-24"
                  />
                  <Input
                    value={ingredient.name}
                    onChange={(e) => handleEditIngredient(index, 'name', e.target.value)}
                    placeholder="Ingredient name"
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Instructions ({importedRecipe.instructions.length} steps)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {importedRecipe.instructions.map((instruction, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-600">{index + 1}.</span> {instruction}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {importedRecipe.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {importedRecipe.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Source</label>
            <p className="text-sm text-blue-600 break-all">{importedRecipe.sourceUrl}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleUseRecipe} className="flex-1">
              Save Recipe
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <CardTitle>Import Recipe from URL</CardTitle>
        </div>
        <CardDescription>
          Paste a URL from popular recipe websites like AllRecipes, Food Network, or Bon Appétit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="recipe-url" className="block text-sm font-medium mb-2">
            Recipe URL
          </label>
          <Input
            id="recipe-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.allrecipes.com/recipe/..."
            disabled={loading}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <X className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            disabled={loading || !url.trim()}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing Recipe...
              </>
            ) : (
              'Import Recipe'
            )}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Supported sites include:</p>
          <p>AllRecipes, Food Network, Simply Recipes, Bon Appétit, Serious Eats, Minimalist Baker, BBC Good Food, and many more</p>
        </div>
      </CardContent>
    </Card>
  )
}
