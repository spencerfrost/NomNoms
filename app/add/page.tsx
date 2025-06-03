'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ingredient } from '@/types'
import { saveRecipe } from '@/lib/client-recipes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, X, FileText, Globe } from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/page-header'
import RecipeUrlImport from '@/components/recipe-url-import'
import { ImportedRecipe } from '@/lib/recipe-import-utils'

type CreateMode = 'select' | 'manual' | 'url'

export default function AddRecipePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createMode, setCreateMode] = useState<CreateMode>('select')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    yield: '',
    newTag: ''
  })
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { amount: 0, unit: '', name: '' }
  ])
  
  const [instructions, setInstructions] = useState<string[]>([''])
  const [tags, setTags] = useState<string[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    setIngredients(prev => 
      prev.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    )
  }

  const addIngredient = () => {
    setIngredients(prev => [...prev, { amount: 0, unit: '', name: '' }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleInstructionChange = (index: number, value: string) => {
    setInstructions(prev => 
      prev.map((instruction, i) => i === index ? value : instruction)
    )
  }

  const addInstruction = () => {
    setInstructions(prev => [...prev, ''])
  }

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(prev => prev.filter((_, i) => i !== index))
    }
  }

  const addTag = () => {
    const tag = formData.newTag.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setFormData(prev => ({ ...prev, newTag: '' }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    }
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }

      const validIngredients = ingredients.filter(
        ing => ing.name.trim() && ing.amount > 0
      )

      if (validIngredients.length === 0) {
        throw new Error('At least one ingredient is required')
      }

      const validInstructions = instructions.filter(inst => inst.trim())

      if (validInstructions.length === 0) {
        throw new Error('At least one instruction is required')
      }

      // Create the recipe data for the API
      const recipeData = {
        slug: generateSlug(formData.title),
        title: formData.title.trim(),
        description: formData.description.trim(),
        yield: formData.yield.trim() || '1 serving',
        ingredients: validIngredients,
        instructions: validInstructions,
        tags: tags
      }

      const slug = await saveRecipe(recipeData)
      router.push(`/recipes/${slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe')
    } finally {
      setLoading(false)
    }
  }

  const handleImportedRecipe = (imported: ImportedRecipe) => {
    // Populate form with imported data
    setFormData({
      title: imported.name,
      description: imported.description,
      yield: `${imported.servings} ${imported.servings === 1 ? 'serving' : 'servings'}`,
      newTag: ''
    })
    
    setIngredients(imported.ingredients.length > 0 ? imported.ingredients : [{ amount: 0, unit: '', name: '' }])
    setInstructions(imported.instructions.length > 0 ? imported.instructions : [''])
    setTags(imported.tags)
    
    // Switch to manual mode to allow editing
    setCreateMode('manual')
  }

  // Mode selection screen
  if (createMode === 'select') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <PageHeader>
            <div>
              <Link href="/">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Recipes
                </Button>
              </Link>
              
              <h1 className="text-4xl font-bold mb-2">Add New Recipe</h1>
              <p className="text-muted-foreground">Choose how you'd like to create your recipe</p>
            </div>
          </PageHeader>

          <div className="grid gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCreateMode('manual')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  <div>
                    <CardTitle>Create from Scratch</CardTitle>
                    <CardDescription>Manually enter all recipe details</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCreateMode('url')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6" />
                  <div>
                    <CardTitle>Import from URL</CardTitle>
                    <CardDescription>Import recipe from AllRecipes, Food Network, and other popular sites</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // URL import screen
  if (createMode === 'url') {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader>
          <div>
            <Button variant="ghost" className="mb-4" onClick={() => setCreateMode('select')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Options
            </Button>
            
            <h1 className="text-4xl font-bold mb-2">Import Recipe</h1>
            <p className="text-muted-foreground">Import a recipe from a URL</p>
          </div>
        </PageHeader>

        <RecipeUrlImport 
          onImported={handleImportedRecipe}
          onCancel={() => setCreateMode('select')}
        />
      </div>
    )
  }

  // Manual creation screen
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <PageHeader>
          <div>
            <Button variant="ghost" className="mb-4" onClick={() => setCreateMode('select')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Options
            </Button>
            
            <h1 className="text-4xl font-bold mb-2">Add New Recipe</h1>
            <p className="text-muted-foreground">Create a new recipe for your collection</p>
          </div>
        </PageHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Spaghetti Carbonara"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="A brief description of your recipe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Yield</label>
                <Input
                  value={formData.yield}
                  onChange={(e) => handleInputChange('yield', e.target.value)}
                  placeholder="e.g., 4 servings, 12 cookies"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add tags to categorize your recipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  value={formData.newTag}
                  onChange={(e) => handleInputChange('newTag', e.target.value)}
                  placeholder="Add a tag (e.g., italian, quick, dessert)"
                  onKeyPress={(e) => handleKeyPress(e, addTag)}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>List all the ingredients needed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Input
                      type="number"
                      step="0.01"
                      value={ingredient.amount || ''}
                      onChange={(e) => handleIngredientChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="Amount"
                      className="w-24"
                    />
                    <Input
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      placeholder="Unit"
                      className="w-20"
                    />
                    <Input
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="flex-1"
                    />
                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button type="button" onClick={addIngredient} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>Step-by-step cooking instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium mt-1">
                      {index + 1}
                    </span>
                    <Input
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      placeholder={`Step ${index + 1} instruction`}
                      className="flex-1"
                    />
                    {instructions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                        className="text-destructive hover:text-destructive mt-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button type="button" onClick={addInstruction} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Recipe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
