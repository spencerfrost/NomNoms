/**
 * Picks the page URL out of what a clipper or share sheet sent to /discover. Client-safe.
 *
 * The bookmarklet sends `url`. Android's share sheet often leaves `url` empty and puts the
 * link in `text`, sometimes after the page title ("Best Pancakes https://...").
 */

const URL_IN_TEXT = /https?:\/\/[^\s<>"']+/i;
// Punctuation that ends a sentence rather than the URL, e.g. "see https://x.com/a)."
const TRAILING_PUNCTUATION = /[.,;:!?)\]}]+$/;

function asHttpUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

/** The first http(s) URL in `text`, or null. */
export function extractFirstUrl(text: string | null | undefined): string | null {
  const match = text?.match(URL_IN_TEXT);
  if (!match) return null;
  return asHttpUrl(match[0].replace(TRAILING_PUNCTUATION, ''));
}

/** `url` if it's a usable http(s) URL, otherwise the first URL found in `text`. */
export function sharedUrl(params: { url?: string | null; text?: string | null }): string | null {
  return (params.url && asHttpUrl(params.url)) || extractFirstUrl(params.url) || extractFirstUrl(params.text);
}
