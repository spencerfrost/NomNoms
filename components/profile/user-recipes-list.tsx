'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Eye, EyeOff, Edit, Trash2, Plus, Clock, ChefHat } from 'lucide-react'
import { EmptyState } from '@/components/common'

interface Recipe {
  id: string
  slug: string
  title: string
  description: string
  image: string | null
  visibility: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface UserRecipesListProps {
  recipes: Recipe[]
}

export default function UserRecipesList({ recipes }: UserRecipesListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (recipeSlug: string) => {
    setDeletingId(recipeSlug)
    
    try {
      const response = await fetch(`/api/recipes/${recipeSlug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }

      // Refresh the page to update the recipe list
      router.refresh()
    } catch (error) {
      console.error('Error deleting recipe:', error)
      // You might want to show an error toast here
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (recipes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            My Recipes
          </h2>
          <Button asChild>
            <Link href="/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Link>
          </Button>
        </div>
        
        <EmptyState
          icon={<ChefHat className="h-16 w-16 text-muted-foreground" />}
          title="No recipes yet"
          description="Start building your recipe collection by adding your first recipe."
          action={{
            label: "Add Your First Recipe",
            onClick: () => router.push('/add')
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ChefHat className="h-6 w-6" />
          My Recipes ({recipes.length})
        </h2>
        <Button asChild>
          <Link href="/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Link 
                    href={`/recipes/${recipe.slug}`}
                    className="text-lg font-semibold hover:text-primary transition-colors"
                  >
                    {recipe.title}
                  </Link>
                  
                  <Badge variant={recipe.visibility === 'public' ? 'default' : 'secondary'}>
                    {recipe.visibility === 'public' ? (
                      <><Eye className="h-3 w-3 mr-1" /> Public</>
                    ) : (
                      <><EyeOff className="h-3 w-3 mr-1" /> Private</>
                    )}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {recipe.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created {formatDate(recipe.createdAt)}
                  </span>
                  {recipe.updatedAt > recipe.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {formatDate(recipe.updatedAt)}
                    </span>
                  )}
                </div>

                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <Link href={`/recipes/${recipe.slug}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deletingId === recipe.slug}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(recipe.slug)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
