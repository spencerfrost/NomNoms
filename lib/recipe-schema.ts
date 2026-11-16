import { z } from 'zod';

/**
 * Request-body schemas for creating and updating recipes. This is the single place
 * recipe input is validated and normalized (trimmed, '' -> null); the data layer
 * trusts what comes out of here. Client-safe: no server-only imports.
 */

export const RECIPE_LIMITS = {
  title: 200,
  description: 5000,
  shortText: 100, // yield, prepTime, cookTime
  imageUrl: 2048,
  sourceUrl: 2048,
  ingredients: 200,
  ingredientName: 200,
  ingredientUnit: 50,
  ingredientAmount: 100_000,
  instructions: 100,
  instruction: 5000,
  tags: 30,
  tag: 50,
} as const;

const L = RECIPE_LIMITS;

const text = (label: string) => z.string({ error: `${label} must be a string` }).trim();

/** Root-relative paths (seed images in /public) or absolute http(s) URLs. */
export function isAllowedImageUrl(value: string): boolean {
  if (value.startsWith('/')) return !value.startsWith('//');
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** Absolute http(s) URLs only: the page a recipe was imported from. */
export function isAllowedSourceUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

// Optional text fields: undefined leaves the stored value alone; null or '' clears it.
const clearable = (schema: z.ZodType<string>) =>
  schema.transform(v => (v === '' ? null : v)).nullable().optional();

const shortText = (label: string) =>
  clearable(text(label).max(L.shortText, `${label} must be at most ${L.shortText} characters`));

export const ingredientSchema = z.object({
  amount: z
    .number({ error: 'amount must be a number' })
    .min(0, 'amount cannot be negative')
    .max(L.ingredientAmount, 'amount is too large'),
  unit: text('unit').max(L.ingredientUnit, 'unit is too long'),
  name: text('name').min(1, 'name is required').max(L.ingredientName, 'name is too long'),
});

// Ingredient messages are prefixed with "Ingredient N: " by formatRecipeError.

// Shared field definitions, deliberately without defaults: defaults belong to create
// only, otherwise an update that omits a field would overwrite it with the default.
const fields = {
  title: text('Title')
    .min(1, 'Title is required')
    .max(L.title, `Title must be at most ${L.title} characters`),
  description: text('Description').max(
    L.description,
    `Description must be at most ${L.description} characters`
  ),
  ingredients: z
    .array(ingredientSchema, { error: 'Ingredients must be an array' })
    .min(1, 'At least one ingredient is required')
    .max(L.ingredients, `At most ${L.ingredients} ingredients`),
  instructions: z
    .array(
      text('Each instruction')
        .min(1, 'Instructions cannot be blank')
        .max(L.instruction, 'An instruction is too long'),
      { error: 'Instructions must be an array of strings' }
    )
    .min(1, 'At least one instruction is required')
    .max(L.instructions, `At most ${L.instructions} instructions`),
  tags: z
    .array(text('Each tag').min(1, 'Tags cannot be blank').max(L.tag, 'A tag is too long'), {
      error: 'Tags must be an array of strings',
    })
    .max(L.tags, `At most ${L.tags} tags`)
    .transform(tags => [...new Set(tags)]),
  yield: shortText('Yield'),
  prepTime: shortText('Prep time'),
  cookTime: shortText('Cook time'),
  image: clearable(
    text('Image')
      .max(L.imageUrl, 'Image URL is too long')
      .refine(v => v === '' || isAllowedImageUrl(v), 'Image must be an http(s) URL')
  ),
  sourceUrl: clearable(
    text('Source URL')
      .max(L.sourceUrl, 'Source URL is too long')
      .refine(v => v === '' || isAllowedSourceUrl(v), 'Source URL must be an http(s) URL')
  ),
  visibility: z.enum(['public', 'private'], {
    error: 'Visibility must be "public" or "private"',
  }),
};

export const recipeCreateSchema = z.object({
  ...fields,
  description: fields.description.default(''),
  tags: fields.tags.default([]),
  visibility: fields.visibility.default('public'),
});

export const recipeUpdateSchema = z.object(fields).partial();

/** What clients send to POST /api/recipes. */
export type RecipeCreatePayload = z.input<typeof recipeCreateSchema>;
/** What clients send to PUT /api/recipes/[slug]. */
export type RecipeUpdatePayload = z.input<typeof recipeUpdateSchema>;
/** Validated, normalized input the data layer accepts. */
export type RecipeCreateInput = z.output<typeof recipeCreateSchema>;
export type RecipeUpdateInput = z.output<typeof recipeUpdateSchema>;

/** One user-facing message for a failed parse, naming the offending field. */
export function formatRecipeError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Invalid recipe';
  if (issue.path.length === 0) return 'Request body must be a JSON object';
  const [field, index, sub] = issue.path;
  if (field === 'ingredients' && typeof index === 'number' && sub !== undefined) {
    return `Ingredient ${index + 1}: ${issue.message}`;
  }
  return issue.message;
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };

function parseWith<S extends z.ZodType>(schema: S, body: unknown): ParseResult<z.output<S>> {
  const result = schema.safeParse(body);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, error: formatRecipeError(result.error) };
}

export const parseRecipeCreate = (body: unknown) => parseWith(recipeCreateSchema, body);
export const parseRecipeUpdate = (body: unknown) => parseWith(recipeUpdateSchema, body);
