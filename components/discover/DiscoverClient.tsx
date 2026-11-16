'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWRInfinite from 'swr/infinite';
import { ArrowLeft, ExternalLink, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import { searchRecipes } from '@/lib/client-recipes';
import { sharedUrl } from '@/lib/shared-url';
import {
  SEARCH_QUERY_MAX_LENGTH,
  buildSearchQuery,
  type AnnotatedSearchResult,
  type RecipeSearchResponse,
} from '@/lib/recipe-search-types';
import RecipePreview from './RecipePreview';
import SearchResultCard from './SearchResultCard';
import ClipperHelp from './ClipperHelp';

interface DiscoverClientProps {
  /** False when the server has no search API key: the search box opens a web search instead. */
  searchEnabled: boolean;
}

const WEB_SEARCH_URL = 'https://search.brave.com/search?q=';

function discoverHref(next: { q?: string; url?: string }): string {
  const params = new URLSearchParams();
  if (next.q) params.set('q', next.q);
  if (next.url) params.set('url', next.url);
  const qs = params.toString();
  return qs ? `/discover?${qs}` : '/discover';
}

/**
 * Discover: search the web for recipes, preview one as a parsed recipe, save it.
 * State lives in the URL (?q= for the search, ?url= for the open preview) so the back
 * button works and the clipper/share target can link straight to a preview. The share
 * target may send the link in ?text= instead of ?url=.
 */
export default function DiscoverClient({ searchEnabled }: DiscoverClientProps) {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const previewUrl = sharedUrl({ url: params.get('url'), text: params.get('text') });

  const [input, setInput] = useState(query);
  // Recipes saved during this visit, so markers update without refetching the search.
  const [savedHere, setSavedHere] = useState<Record<string, string>>({});

  // Follow back/forward navigation.
  useEffect(() => setInput(query), [query]);

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<RecipeSearchResponse>(
    (index, previous: RecipeSearchResponse | null) => {
      if (!searchEnabled || !query) return null;
      if (previous && !previous.hasMore) return null;
      return ['discover-search', query, index];
    },
    ([, q, page]: [string, string, number]) => searchRecipes(q, page),
    { revalidateOnFocus: false, revalidateFirstPage: false, shouldRetryOnError: false }
  );

  const results = useMemo(() => {
    const seen = new Set<string>();
    const out: AnnotatedSearchResult[] = [];
    for (const result of data?.flatMap(page => page.results) ?? []) {
      if (seen.has(result.url)) continue;
      seen.add(result.url);
      out.push({ ...result, savedSlug: savedHere[result.url] ?? result.savedSlug });
    }
    return out;
  }, [data, savedHere]);

  const hasMore = data?.[data.length - 1]?.hasMore ?? false;
  const loadingMore = isValidating && size > (data?.length ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // A pasted link (possibly with a title around it) opens the preview.
    const link = sharedUrl({ text });
    if (link) {
      router.push(discoverHref({ q: query, url: link }));
      return;
    }

    if (searchEnabled) {
      router.push(discoverHref({ q: text }));
    } else {
      window.open(
        `${WEB_SEARCH_URL}${encodeURIComponent(buildSearchQuery(text))}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  const savedSlugForPreview = previewUrl
    ? (savedHere[previewUrl] ?? results.find(r => r.url === previewUrl)?.savedSlug ?? null)
    : null;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <PageHeader>
        <div>
          <h1 className="text-3xl font-display font-bold">Discover</h1>
          <p className="text-muted-foreground">
            {searchEnabled
              ? 'Search the web for recipes, or paste a link to one.'
              : 'Paste a link to a recipe, or search the web in a new tab.'}
          </p>
        </div>
      </PageHeader>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6" role="search">
        <Input
          aria-label="Search recipes or paste a link"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. chicken tikka masala, or https://…"
          maxLength={2048}
          enterKeyHint="search"
        />
        <Button type="submit" disabled={!input.trim()}>
          {searchEnabled || sharedUrl({ text: input }) ? (
            <Search className="h-4 w-4 sm:mr-2" />
          ) : (
            <ExternalLink className="h-4 w-4 sm:mr-2" />
          )}
          <span className="hidden sm:inline">
            {sharedUrl({ text: input }) ? 'Preview' : searchEnabled ? 'Search' : 'Search web'}
          </span>
        </Button>
      </form>
      {searchEnabled && input.trim().length > SEARCH_QUERY_MAX_LENGTH && !sharedUrl({ text: input }) && (
        <p className="-mt-4 mb-6 text-sm text-destructive">
          Searches can be at most {SEARCH_QUERY_MAX_LENGTH} characters.
        </p>
      )}

      {previewUrl ? (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.replace(discoverHref({ q: query }))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {query ? 'Back to results' : 'Close preview'}
          </Button>
          <RecipePreview
            key={previewUrl}
            url={previewUrl}
            savedSlug={savedSlugForPreview}
            onSaved={slug => setSavedHere(prev => ({ ...prev, [previewUrl]: slug }))}
          />
        </div>
      ) : query && searchEnabled ? (
        <section aria-label="Search results" aria-busy={isLoading}>
          {isLoading ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </p>
          ) : error && results.length === 0 ? (
            <p role="alert" className="text-destructive">
              {error instanceof Error ? error.message : 'Search failed'}
            </p>
          ) : results.length === 0 ? (
            <p className="text-muted-foreground">No results for “{query}”.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {results.map(result => (
                  <SearchResultCard
                    key={result.url}
                    result={result}
                    onSelect={r => router.push(discoverHref({ q: query, url: r.url }))}
                  />
                ))}
              </ul>
              {error && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                  {error instanceof Error ? error.message : 'Search failed'}
                </p>
              )}
              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" onClick={() => setSize(size + 1)} disabled={loadingMore}>
                    {loadingMore && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    More results
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        <ClipperHelp />
      )}
    </div>
  );
}
