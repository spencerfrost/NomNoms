'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ingredient } from '@/types';
import { saveRecipe } from '@/lib/client-recipes';
import type { ImportedRecipe } from '@/lib/recipe-import-utils';
import {
  EMPTY_INGREDIENT,
  importedRecipeToForm,
  takeStashedImportedRecipe,
  type RecipeFormData,
} from '@/lib/imported-recipe';
import {
  RecipeModeSelector,
  RecipeBasicInfoForm,
  RecipeTagsManager,
  RecipeIngredientsEditor,
  RecipeInstructionsEditor,
  RecipeFormContainer,
  RecipeUrlImportScreen,
} from '@/components/recipe/form';

type CreateMode = 'select' | 'manual' | 'url';

export default function AddRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<CreateMode>('select');

  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    imageUrl: '',
    yield: '',
    prepTime: '',
    cookTime: '',
    visibility: 'public',
    sourceUrl: '',
    newTag: '',
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([{ ...EMPTY_INGREDIENT }]);

  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    setIngredients(prev =>
      prev.map((ingredient, i) => (i === index ? { ...ingredient, [field]: value } : ingredient))
    );
  };

  const addIngredient = () => {
    setIngredients(prev => [...prev, { amount: 0, unit: '', name: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    setInstructions(prev => prev.map((instruction, i) => (i === index ? value : instruction)));
  };

  const addInstruction = () => {
    setInstructions(prev => [...prev, '']);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    const tag = formData.newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
      setFormData(prev => ({ ...prev, newTag: '' }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      const validIngredients = ingredients.filter(ing => ing.name.trim());

      if (validIngredients.length === 0) {
        throw new Error('At least one ingredient is required');
      }

      const validInstructions = instructions.filter(inst => inst.trim());

      if (validInstructions.length === 0) {
        throw new Error('At least one instruction is required');
      }

      // Create the recipe data for the API
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.imageUrl.trim() || null,
        yield: formData.yield.trim() || '1 serving',
        prepTime: formData.prepTime.trim() || null,
        cookTime: formData.cookTime.trim() || null,
        sourceUrl: formData.sourceUrl.trim() || null,
        ingredients: validIngredients,
        instructions: validInstructions,
        tags: tags,
        visibility: formData.visibility === 'private' ? ('private' as const) : ('public' as const),
      };

      const slug = await saveRecipe(recipeData);
      router.push(`/recipes/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleImportedRecipe = (imported: ImportedRecipe) => {
    const prefill = importedRecipeToForm(imported);
    setFormData(prefill.formData);
    setIngredients(prefill.ingredients);
    setInstructions(prefill.instructions);
    setTags(prefill.tags);
    // Switch to manual mode to allow editing
    setCreateMode('manual');
  };

  // "Edit first" on Discover stashes the parsed recipe; open straight into the form with it.
  useEffect(() => {
    const stashed = takeStashedImportedRecipe();
    if (stashed) handleImportedRecipe(stashed);
  }, []);

  // Mode selection screen
  if (createMode === 'select') {
    return <RecipeModeSelector onModeChange={setCreateMode} />;
  }

  // URL import screen
  if (createMode === 'url') {
    return (
      <RecipeUrlImportScreen
        onImported={handleImportedRecipe}
        onCancel={() => setCreateMode('select')}
      />
    );
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
          yield: formData.yield,
          prepTime: formData.prepTime,
          cookTime: formData.cookTime,
          visibility: formData.visibility,
          sourceUrl: formData.sourceUrl,
        }}
        onChange={handleInputChange}
      />

      <RecipeTagsManager
        tags={tags}
        newTag={formData.newTag}
        onTagAdd={addTag}
        onTagRemove={removeTag}
        onNewTagChange={value => handleInputChange('newTag', value)}
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
  );
}
