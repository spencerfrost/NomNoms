/**
 * Site-wide values for <head> metadata and link previews (Open Graph / Twitter cards).
 *
 * Next.js replaces, rather than merges, a parent's `openGraph` object when a page sets its
 * own, so pages that set `openGraph` should spread `siteOpenGraph` and fall back to
 * `DEFAULT_SHARE_IMAGE` when they have no image of their own.
 */
export const SITE_NAME = 'NomNoms';

export const SITE_DESCRIPTION =
  'Your personal recipe collection. Search, scale, and manage your favorite recipes.';

export const SHARE_TAGLINE = 'Your recipes, all in one tasty place.';

/** Served by `app/opengraph-image.tsx` (rendered once at build time). */
export const DEFAULT_SHARE_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}: ${SHARE_TAGLINE}`,
};

export const siteOpenGraph = {
  siteName: SITE_NAME,
  locale: 'en_US',
} as const;
