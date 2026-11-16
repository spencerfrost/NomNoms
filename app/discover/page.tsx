import { Suspense } from 'react';
import type { Metadata } from 'next';
import DiscoverClient from '@/components/discover/DiscoverClient';
import { isSearchConfigured } from '@/lib/recipe-search';

export const metadata: Metadata = {
  title: 'Discover',
  robots: { index: false, follow: false },
};

// Whether search is available depends on the runtime env, not the build's.
export const dynamic = 'force-dynamic';

/**
 * Signed-in only (middleware redirects). A thin server wrapper so the client page knows
 * whether a search API key is configured without exposing the key.
 */
export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverClient searchEnabled={isSearchConfigured()} />
    </Suspense>
  );
}
