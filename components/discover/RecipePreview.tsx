'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { toast } from 'sonner';
import { AlertCircle, Check, Clock, ExternalLink, Loader2, Pencil, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { importRecipe, saveRecipe } from '@/lib/client-recipes';
import { formatAmountRange } from '@/lib/amount-utils';
import { shouldSkipOptimization } from '@/lib/image-hosts';
import {
  formatMinutes,
  formatServings,
  importedRecipeToPayload,
  stashImportedRecipe,
} from '@/lib/imported-recipe';
import { sourceHost } from '@/lib/source-url';
import type { ImportedRecipe } from '@/lib/recipe-import-utils';

interface RecipePreviewProps {
  url: string;
  /** Slug of a recipe already saved from this URL, if known. */
  savedSlug?: string | null;
  onSaved?: (slug: string) => void;
}

// Parsed previews are cached by URL for the session: reopening a result doesn't refetch.
const PREVIEW_SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  shouldRetryOnError: false,
};

function OpenOriginal({ url }: { url: string }) {
  return (
    <Button variant="outline" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer nofollow">
        <ExternalLink className="h-4 w-4 mr-2" />
        Open original
      </a>
    </Button>
  );
}

export default function RecipePreview({ url, savedSlug, onSaved }: RecipePreviewProps) {
  const { data: recipe, error, isLoading } = useSWR<ImportedRecipe>(
    ['discover-preview', url],
    () => importRecipe(url),
    PREVIEW_SWR_OPTIONS
  );
  const site = sourceHost(url) ?? url;

  if (isLoading) {
    return (
      <Card aria-busy="true" aria-label="Loading recipe preview">
        <CardContent className="space-y-4 pt-6">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reading recipe from {site}…
          </p>
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (error || !recipe) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div role="alert" className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Couldn&apos;t read a recipe from {site}</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Failed to import recipe'}
              </p>
            </div>
          </div>
          <OpenOriginal url={url} />
        </CardContent>
      </Card>
    );
  }

  return <ParsedRecipe recipe={recipe} url={url} site={site} savedSlug={savedSlug} onSaved={onSaved} />;
}

function ParsedRecipe({
  recipe,
  url,
  site,
  savedSlug,
  onSaved,
}: {
  recipe: ImportedRecipe;
  url: string;
  site: string;
  savedSlug?: string | null;
  onSaved?: (slug: string) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const times = [
    recipe.prepTimeMinutes > 0 && `Prep ${formatMinutes(recipe.prepTimeMinutes)}`,
    recipe.cookTimeMinutes > 0 && `Cook ${formatMinutes(recipe.cookTimeMinutes)}`,
  ].filter(Boolean);
  const servings = formatServings(recipe.servings);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const slug = await saveRecipe(importedRecipeToPayload(recipe));
      onSaved?.(slug);
      toast.success(`Saved “${recipe.name}”`, {
        action: { label: 'View', onClick: () => router.push(`/recipes/${encodeURIComponent(slug)}`) },
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const handleEditFirst = () => {
    stashImportedRecipe(recipe);
    router.push('/add');
  };

  return (
    <Card className="overflow-hidden pt-0">
      {recipe.imageUrl && (
        <div className="relative h-56 md:h-72 w-full bg-muted">
          <Image
            src={recipe.imageUrl}
            unoptimized={shouldSkipOptimization(recipe.imageUrl)}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}
      <CardContent className="space-y-6 pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{site}</p>
          <h2 className="text-2xl font-display font-bold">{recipe.name}</h2>
          {recipe.description && (
            <p className="mt-2 text-muted-foreground">{recipe.description}</p>
          )}
          {(times.length > 0 || servings) && (
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {times.length > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {times.join(' · ')}
                </span>
              )}
              {servings && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {servings}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {savedSlug ? (
            <Button asChild>
              <Link href={`/recipes/${encodeURIComponent(savedSlug)}`}>
                <Check className="h-4 w-4 mr-2" />
                Saved · View recipe
              </Link>
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving…' : 'Save'}
            </Button>
          )}
          <Button variant="outline" onClick={handleEditFirst}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit first
          </Button>
          <OpenOriginal url={url} />
        </div>
        {saveError && (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-5">
          <section className="md:col-span-2">
            <h3 className="font-semibold mb-2">Ingredients ({recipe.ingredients.length})</h3>
            {recipe.ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground">None found on the page.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {recipe.ingredients.map((ingredient, i) => {
                  const amount = formatAmountRange(ingredient);
                  const quantity = [amount, ingredient.unit].filter(Boolean).join(' ');
                  return (
                    <li key={`${i}-${ingredient.name}`}>
                      {quantity && <span className="font-medium">{quantity} </span>}
                      {ingredient.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section className="md:col-span-3">
            <h3 className="font-semibold mb-2">Steps ({recipe.instructions.length})</h3>
            {recipe.instructions.length === 0 ? (
              <p className="text-sm text-muted-foreground">None found on the page.</p>
            ) : (
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                {recipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
