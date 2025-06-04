'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ingredient } from '@/types'
import { saveRecipe } from '@/lib/client-recipes'
import { ImportedRecipe } from '@/lib/recipe-import-utils'
import { generateSlug } from '@/lib/recipe-utils'
import {
  RecipeModeSelector,
  RecipeBasicInfoForm,
  RecipeTagsManager,
  RecipeIngredientsEditor,
  RecipeInstructionsEditor,
  RecipeFormContainer,
  RecipeUrlImportScreen
} from '@/components/recipe/form'

type CreateMode = 'select' | 'manual' | 'url'

export default function AddRecipePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createMode, setCreateMode] = useState<CreateMode>('select')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
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

      const slug = generateSlug(formData.title)

      // Create the recipe data for the API
      const recipeData = {
        slug,
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.imageUrl.trim() || null,
        yield: formData.yield.trim() || '1 serving',
        ingredients: validIngredients,
        instructions: validInstructions,
        tags: tags
      }

      await saveRecipe(recipeData)
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
      imageUrl: imported.imageUrl || '',
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
    return <RecipeModeSelector onModeChange={setCreateMode} />
  }

  // URL import screen
  if (createMode === 'url') {
    return (
      <RecipeUrlImportScreen 
        onImported={handleImportedRecipe}
        onCancel={() => setCreateMode('select')}
      />
    )
  }

  // Manual creation screen
  return (
    <RecipeFormContainer
      onSubmit={handleSubmit}
      onBack={() => setCreateMode('select')}
      loading={loading}
      error={error}
    >
      <RecipeBasicInfoForm
        formData={{
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          yield: formData.yield
        }}
        onChange={handleInputChange}
      />

      <RecipeTagsManager
        tags={tags}
        newTag={formData.newTag}
        onTagAdd={addTag}
        onTagRemove={removeTag}
        onNewTagChange={(value) => handleInputChange('newTag', value)}
      />

      <RecipeIngredientsEditor
        ingredients={ingredients}
        onChange={handleIngredientChange}
        onAdd={addIngredient}
        onRemove={removeIngredient}
      />

      <RecipeInstructionsEditor
        instructions={instructions}
        onChange={handleInstructionChange}
        onAdd={addInstruction}
        onRemove={removeInstruction}
      />
    </RecipeFormContainer>
  )
}
