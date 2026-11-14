/**
 * Remote hosts that Next's image optimizer may proxy. Used by next.config.ts.
 *
 * Images from any other remote host are rendered with `unoptimized` (the browser loads
 * them directly) so imported recipes still show images without turning
 * /_next/image into an open proxy.
 */
export const OPTIMIZED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'www.marthastewart.com',
  'www.foodnetwork.com',
  'www.allrecipes.com',
  'www.tasteofhome.com',
  'www.epicurious.com',
  'www.bonappetit.com',
  'www.seriouseats.com',
  'www.kingarthurbaking.com',
  'www.foodandwine.com',
  '*.cloudinary.com',
  '*.googleusercontent.com',
];

function hostMatches(host: string, pattern: string): boolean {
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(1); // ".cloudinary.com"
    return host.endsWith(suffix) && host.length > suffix.length;
  }
  return host === pattern;
}

/** True when `src` should bypass the Next image optimizer. */
export function shouldSkipOptimization(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return false; // local asset
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return true;
    return !OPTIMIZED_IMAGE_HOSTS.some(p => hostMatches(url.hostname, p));
  } catch {
    return true;
  }
}
