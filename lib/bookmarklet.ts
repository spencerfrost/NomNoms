/**
 * The "Save to NomNoms" bookmarklet, for sites that block server-side imports.
 *
 * It runs on the recipe page, opens `/add/clip` in a new tab, waits for that tab to say
 * it's ready, and posts it the page's HTML (minus scripts, styles and other bulk; JSON-LD
 * is kept). The site only ever sees the user's own browser. Client-safe.
 *
 * Protocol (window.postMessage):
 *   clip tab -> opener: { type: CLIP_READY }                    (targetOrigin '*')
 *   opener -> clip tab: { type: CLIP_PAGE, url, html }          (targetOrigin = our origin)
 */
export const CLIP_PATH = '/add/clip';
export const CLIP_READY = 'nomnoms:clip-ready';
export const CLIP_PAGE = 'nomnoms:clip-page';

export interface ClipMessage {
  type: typeof CLIP_PAGE;
  url: string;
  html: string;
}

export function isClipMessage(data: unknown): data is ClipMessage {
  const d = data as Partial<ClipMessage> | null;
  return (
    !!d &&
    d.type === CLIP_PAGE &&
    typeof d.url === 'string' &&
    typeof d.html === 'string'
  );
}

/** Elements that never carry recipe data; dropping them keeps the upload small. */
const STRIP_SELECTOR =
  'script:not([type="application/ld+json"]),style,link,svg,noscript,iframe,template,video,audio,canvas';

/** The bookmarklet's source, plain ES5 so it runs on any page. */
export function bookmarkletSource(origin: string): string {
  const o = JSON.stringify(origin);
  const clipUrl = JSON.stringify(origin + CLIP_PATH);
  return `(function(){
var o=${o},w=window.open(${clipUrl},'_blank');
if(!w){alert('NomNoms: allow pop-ups for this site, then try again.');return;}
var d=document.documentElement.cloneNode(true);
d.querySelectorAll(${JSON.stringify(STRIP_SELECTOR)}).forEach(function(e){e.parentNode.removeChild(e);});
var m={type:${JSON.stringify(CLIP_PAGE)},url:location.href,html:d.outerHTML};
function f(e){
if(e.origin!==o||e.source!==w||!e.data||e.data.type!==${JSON.stringify(CLIP_READY)})return;
w.postMessage(m,o);removeEventListener('message',f);
}
addEventListener('message',f);
})();`;
}

/** A `javascript:` URL for the bookmark itself. */
export function bookmarkletHref(origin: string): string {
  const code = bookmarkletSource(origin)
    .split('\n')
    .map(line => line.trim())
    .join('');
  return 'javascript:' + encodeURIComponent(code);
}
