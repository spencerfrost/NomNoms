'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Ingredient, Recipe, getRecipeIngredients } from '@/types'
import { getRecipeBySlug, updateRecipe } from '@/lib/client-recipes'
import { generateSlug } from '@/lib/recipe-utils'
import {
  RecipeBasicInfoForm,
  RecipeTagsManager,
  RecipeIngredientsEditor,
  RecipeInstructionsEditor,
  RecipeFormContainer,
} from '@/components/recipe/form'
import { LoadingSpinner, NotFound } from '@/components/common'
import { useSession } from 'next-auth/react'

export default function EditRecipePage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { data: session, status } = useSession()
  
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    yield: '',
    prepTime: '',
    cookTime: '',
    visibility: 'public',
    newTag: ''
  })
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { amount: 0, unit: '', name: '' }
  ])
  
  const [instructions, setInstructions] = useState<string[]>([''])
  const [tags, setTags] = useState<string[]>([])

  // Tag management
  const addTag = () => {
    if (formData.newTag.trim()) {
      setTags(prev => [...prev, formData.newTag.trim()])
      setFormData(prev => ({ ...prev, newTag: '' }))
    }
  }
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }
  
  // Ingredient management
  const addIngredient = () => {
    setIngredients(prev => [...prev, { amount: 0, unit: '', name: '' }])
  }
  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index))
  }
  
  // Instruction management
  const addInstruction = () => {
    setInstructions(prev => [...prev, ''])
  }
  const removeInstruction = (index: number) => {
    setInstructions(prev => prev.filter((_, i) => i !== index))
  }

  // Load the recipe for editing
  useEffect(() => {
    async function loadRecipe() {
      try {
        const recipeData = await getRecipeBySlug(slug)
        if (!recipeData) {
          setLoadError('Recipe not found')
          return
        }

        // Check if user can edit this recipe
        if (status === 'authenticated' && session?.user?.id !== recipeData.authorId) {
          setLoadError('You can only edit your own recipes')
          return
        }

        setRecipe(recipeData)
        
        // Populate form with existing data
        setFormData({
          title: recipeData.title,
          description: recipeData.description || '',
          imageUrl: recipeData.image || '',
          yield: recipeData.yield || '',
          prepTime: recipeData.prepTime || '',
          cookTime: recipeData.cookTime || '',
          visibility: recipeData.visibility || 'public',
          newTag: ''
        })
        
        // Parse ingredients from the recipe
        const recipeIngredients = getRecipeIngredients(recipeData)
        setIngredients(recipeIngredients.length > 0 ? recipeIngredients : [{ amount: 0, unit: '', name: '' }])
        
        setInstructions(recipeData.instructions.length > 0 ? recipeData.instructions : [''])
        setTags(recipeData.tags || [])
        
      } catch (err) {
        console.error('Error loading recipe:', err)
        setLoadError('Failed to load recipe')
      } finally {
        setLoading(false)
      }
    }

    if (slug && status !== 'loading') {
      loadRecipe()
    }
  }, [slug, session, status])

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

  const handleInstructionChange = (index: number, value: string) => {
    setInstructions(prev => 
      prev.map((instruction, i) => 
        i === index ? value : instruction
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
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

      // Generate new slug if title changed
      const newSlug = formData.title !== recipe?.title ? generateSlug(formData.title) : slug

      // Create the recipe data for the API
      const recipeData = {
        slug: newSlug,
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.imageUrl.trim() || undefined,
        yield: formData.yield.trim() || undefined,
        prepTime: formData.prepTime.trim() || undefined,
        cookTime: formData.cookTime.trim() || undefined,
        ingredients: validIngredients,
        instructions: validInstructions,
        tags: tags,
        visibility: formData.visibility as string,
      }

      const updatedSlug = await updateRecipe(slug, recipeData)
      
      // Navigate to the recipe (potentially with new slug)
      router.push(`/recipes/${updatedSlug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recipe')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push(`/recipes/${slug}`)
  }

  // Show loading while checking auth and loading recipe
  if (loading || status === 'loading') {
    return (
      <LoadingSpinner
        text="Loading recipe..."
        size="large"
        fullScreen
      />
    )
  }

  // Handle authentication
  if (status === 'unauthenticated') {
    return (
      <NotFound
        title="Authentication Required"
        message="You must be signed in to edit recipes."
        backButtonText="Sign In"
        backButtonUrl="/auth/signin"
      />
    )
  }

  // Handle load errors
  if (loadError || !recipe) {
    return (
      <NotFound
        title="Cannot Edit Recipe"
        message={loadError || "The recipe you're trying to edit doesn't exist."}
        backButtonText="Back to Recipes"
        backButtonUrl="/"
      />
    )
  }

  return (
    <RecipeFormContainer
      onSubmit={handleSubmit}
      onBack={handleBack}
      loading={saving}
      error={error}
      isEditing={true}
      recipeTitle={recipe.title}
    >
      {/* Basic Info */}
      <RecipeBasicInfoForm
        formData={formData}
        onChange={handleInputChange}
      />

      {/* Tags */}
    <RecipeTagsManager
      tags={tags}
      newTag={formData.newTag}
      onTagAdd={addTag}
      onTagRemove={removeTag}
      onNewTagChange={(value: string) => handleInputChange('newTag', value)}
    />

      {/* Ingredients */}
    <RecipeIngredientsEditor
      ingredients={ingredients}
      onChange={handleIngredientChange}
      onAdd={addIngredient}
      onRemove={removeIngredient}
    />

      {/* Instructions */}
    <RecipeInstructionsEditor
      instructions={instructions}
      onChange={handleInstructionChange}
      onAdd={addInstruction}
      onRemove={removeInstruction}
    />
    </RecipeFormContainer>
  )
}
