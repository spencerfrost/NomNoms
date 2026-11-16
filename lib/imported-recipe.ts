/**
 * Maps an `ImportedRecipe` (what POST /api/recipes/import returns) to the add form's state
 * or straight to a create payload. Shared by the add page and Discover.
 *
 * Client-safe. Only `import type` from recipe-import-utils: its values pull node:dns into
 * the client bundle.
 */
import type { ImportedRecipe } from './recipe-import-utils';
import type { Ingredient } from '@/types/recipe';
import { RECIPE_LIMITS as L, isAllowedImageUrl, isAllowedSourceUrl } from './recipe-schema';
import type { RecipeCreatePayload } from './recipe-schema';

export type Visibility = 'public' | 'private';

/** The add/edit form's text fields. */
export interface RecipeFormData {
  title: string;
  description: string;
  imageUrl: string;
  yield: string;
  prepTime: string;
  cookTime: string;
  visibility: string;
  sourceUrl: string;
  newTag: string;
}

export interface RecipeFormState {
  formData: RecipeFormData;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
}

export const EMPTY_INGREDIENT: Ingredient = { amount: 0, unit: '', name: '' };

/** 45 -> "45 min", 90 -> "1 hr 30 min", 0 -> "". */
export function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '';
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (hours === 0) return `${mins} min`;
  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
}

export function formatServings(servings: number): string {
  if (!Number.isFinite(servings) || servings <= 0) return '';
  return `${servings} ${servings === 1 ? 'serving' : 'servings'}`;
}

const clip = (value: string, max: number) => value.trim().slice(0, max);

/**
 * Brings scraped data inside the schema's limits so a one-click save doesn't fail on
 * things the user never typed (40 keyword tags, a 300-character ingredient line).
 * Missing ingredients or steps are left empty: the server rejects those with a clear
 * message, and the user can fix them with "Edit first".
 */
function cleanIngredients(ingredients: Ingredient[]): Ingredient[] {
  return ingredients
    .map(i => ({
      amount: Number.isFinite(i.amount) ? Math.min(Math.max(i.amount, 0), L.ingredientAmount) : 0,
      unit: clip(i.unit ?? '', L.ingredientUnit),
      name: clip(i.name ?? '', L.ingredientName),
    }))
    .filter(i => i.name)
    .slice(0, L.ingredients);
}

function cleanInstructions(instructions: string[]): string[] {
  return instructions
    .map(step => clip(step ?? '', L.instruction))
    .filter(Boolean)
    .slice(0, L.instructions);
}

function cleanTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = (raw ?? '').trim();
    const key = tag.toLowerCase();
    if (!tag || tag.length > L.tag || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length === L.tags) break;
  }
  return out;
}

const validImage = (url: string | null) => (url && isAllowedImageUrl(url) ? url : null);
const validSource = (url: string) => (url && isAllowedSourceUrl(url) ? url : null);

/** Prefill state for the add form. */
export function importedRecipeToForm(
  imported: ImportedRecipe,
  visibility: Visibility = imported.isPublic ? 'public' : 'private'
): RecipeFormState {
  const ingredients = cleanIngredients(imported.ingredients);
  const instructions = cleanInstructions(imported.instructions);
  return {
    formData: {
      title: clip(imported.name, L.title),
      description: clip(imported.description, L.description),
      imageUrl: validImage(imported.imageUrl) ?? '',
      yield: formatServings(imported.servings),
      prepTime: formatMinutes(imported.prepTimeMinutes),
      cookTime: formatMinutes(imported.cookTimeMinutes),
      visibility,
      sourceUrl: validSource(imported.sourceUrl) ?? '',
      newTag: '',
    },
    ingredients: ingredients.length > 0 ? ingredients : [{ ...EMPTY_INGREDIENT }],
    instructions: instructions.length > 0 ? instructions : [''],
    tags: cleanTags(imported.tags),
  };
}

/** Create payload for saving an imported recipe as-is. Defaults to private. */
export function importedRecipeToPayload(
  imported: ImportedRecipe,
  visibility: Visibility = 'private'
): RecipeCreatePayload {
  return {
    title: clip(imported.name, L.title),
    description: clip(imported.description, L.description),
    image: validImage(imported.imageUrl),
    yield: formatServings(imported.servings) || null,
    prepTime: formatMinutes(imported.prepTimeMinutes) || null,
    cookTime: formatMinutes(imported.cookTimeMinutes) || null,
    sourceUrl: validSource(imported.sourceUrl),
    ingredients: cleanIngredients(imported.ingredients),
    instructions: cleanInstructions(imported.instructions),
    tags: cleanTags(imported.tags),
    visibility,
  };
}

// "Edit first" on Discover hands the parsed recipe to /add through sessionStorage, so the
// add page doesn't fetch the page a second time.
const STASH_KEY = 'nomnoms:imported-recipe';

export function stashImportedRecipe(imported: ImportedRecipe): void {
  try {
    sessionStorage.setItem(STASH_KEY, JSON.stringify(imported));
  } catch {
    // Storage full or disabled: /add just opens empty.
  }
}

/** Returns the stashed recipe once, then clears it. */
export function takeStashedImportedRecipe(): ImportedRecipe | null {
  try {
    const raw = sessionStorage.getItem(STASH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STASH_KEY);
    const parsed = JSON.parse(raw) as ImportedRecipe;
    if (
      !parsed ||
      typeof parsed.name !== 'string' ||
      !Array.isArray(parsed.ingredients) ||
      !Array.isArray(parsed.instructions) ||
      !Array.isArray(parsed.tags)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
