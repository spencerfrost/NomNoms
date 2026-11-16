/**
 * Helpers for a recipe's source URL (the page it was imported from). Client-safe.
 */

/** "https://www.example.com/a/b" -> "example.com". Null when `url` isn't parseable. */
export function sourceHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Spellings of the same page that should count as "already saved": the URL as given, and
 * with or without a trailing slash and fragment. Search providers and sites aren't
 * consistent about either, so an exact match alone misses obvious duplicates.
 */
export function sourceUrlVariants(url: string): string[] {
  const variants = new Set([url]);
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    const base = parsed.href;
    variants.add(base);
    if (parsed.search === '') {
      variants.add(base.endsWith('/') ? base.slice(0, -1) : `${base}/`);
    }
  } catch {
    // Not a URL: only the exact string can match.
  }
  return [...variants];
}
