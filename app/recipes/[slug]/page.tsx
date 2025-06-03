'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Recipe, getRecipeIngredients } from '@/types'
import { getRecipeBySlug } from '@/lib/client-recipes'
import { ScaleControls } from '@/components/scale-controls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, ChefHat } from 'lucide-react'
import Link from 'next/link'
import { formatIngredientAmount } from '@/lib/recipe-utils'

export default function RecipePage() {
  const params = useParams()
  const slug = params.slug as string
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [multiplier, setMultiplier] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRecipe() {
      try {
        const recipeData = await getRecipeBySlug(slug)
        if (recipeData) {
          setRecipe(recipeData)
        } else {
          setError('Recipe not found')
        }
      } catch (err) {
        console.error('Error loading recipe:', err)
        setError('Failed to load recipe')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadRecipe()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading recipe...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your recipe</p>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Recipe Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The recipe you\'re looking for doesn\'t exist.'}</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const scaledYield = recipe.yield?.replace(/\d+/g, (match) => 
    String(Math.round(parseInt(match) * multiplier))
  ) || ''

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-2">{recipe.title}</h1>
              <p className="text-muted-foreground text-lg mb-4">{recipe.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  <span>Yields: {scaledYield}</span>
                </div>
                {recipe.prepTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Prep: {recipe.prepTime}</span>
                  </div>
                )}
                {recipe.cookTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Cook: {recipe.cookTime}</span>
                  </div>
                )}
              </div>
            </div>
            
            {recipe.image && (
              <div className="lg:col-span-1">
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Ingredients + Scale Controls */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>Scale the recipe to your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <ScaleControls 
                    multiplier={multiplier} 
                    onMultiplierChange={setMultiplier} 
                  />
                </div>
                
                <ul className="space-y-2">
                  {getRecipeIngredients(recipe).map((ingredient) => {
                    // Scale the amount and format for display
                    const scaledAmount = ingredient.amount * multiplier;
                    const formattedAmount = formatIngredientAmount(scaledAmount);
                    const displayText = ingredient.unit 
                      ? `${formattedAmount} ${ingredient.unit}`
                      : formattedAmount;
                    
                    return (
                      <li key={ingredient.name} className="flex justify-between items-start">
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-muted-foreground text-sm ml-2 flex-shrink-0">
                          {displayText}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>Follow these steps to make your recipe</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={`step-${index}-${instruction.slice(0, 20)}`} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="pt-1">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
