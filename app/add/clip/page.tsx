'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { importClippedRecipe } from '@/lib/client-recipes';
import { stashImportedRecipe } from '@/lib/imported-recipe';
import { CLIP_READY, isClipMessage } from '@/lib/bookmarklet';

/** How long to wait for the bookmarklet's page before assuming it isn't coming. */
const WAIT_MS = 15_000;

/**
 * Opened by the bookmarklet (see lib/bookmarklet.ts). Receives the recipe page from the
 * opener tab, parses it on the server, and hands the result to /add the same way
 * Discover's "Edit first" does. Behind the /add sign-in check in middleware.
 */
export default function ClipRecipePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    const opener = window.opener as Window | null;
    if (!opener) {
      setError('Open this page with the NomNoms bookmarklet while viewing a recipe.');
      return;
    }

    const timer = setTimeout(() => {
      if (!handled.current) {
        setError("The recipe page didn't send anything. Go back to it and click the bookmarklet again.");
      }
    }, WAIT_MS);

    const onMessage = async (event: MessageEvent) => {
      if (event.source !== opener || !isClipMessage(event.data) || handled.current) return;
      // The page can only describe itself: reject a URL from a different site than the sender.
      let sameSite = false;
      try {
        sameSite = new URL(event.data.url).origin === event.origin;
      } catch {}
      if (!sameSite) return;

      handled.current = true;
      clearTimeout(timer);
      try {
        const recipe = await importClippedRecipe(event.data.url, event.data.html);
        stashImportedRecipe(recipe);
        router.replace('/add');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import recipe');
      }
    };

    window.addEventListener('message', onMessage);
    opener.postMessage({ type: CLIP_READY }, '*');
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="container max-w-xl mx-auto px-4 pt-10 pb-8">
      <Card>
        <CardContent className="pt-6">
          {error ? (
            <div className="space-y-4">
              <div role="alert" className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Couldn&apos;t import that recipe</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/add">Add it manually</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/bookmarklet">About the bookmarklet</Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2" role="status">
              <Loader2 className="h-5 w-5 animate-spin" />
              Reading the recipe…
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
