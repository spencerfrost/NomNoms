'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Shown when loading the recipe throws (e.g. the database is down). A missing or
// private recipe goes to not-found.tsx instead, so this never says "not found".
export default function RecipeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error loading recipe:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Couldn&apos;t load this recipe</h1>
        <p className="text-muted-foreground">Something went wrong on our end. Please try again.</p>
        <div className="flex justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/">
            <Button variant="outline">Back to Recipes</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
