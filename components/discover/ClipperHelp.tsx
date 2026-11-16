'use client';

import { useEffect, useRef } from 'react';
import { Bookmark } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** The bookmarklet's code: sends the current page to this app's Discover preview. */
export function bookmarkletHref(origin: string): string {
  return `javascript:location.href='${origin}/discover?url='+encodeURIComponent(location.href)`;
}

/**
 * Ways to send a page from the normal browser to Discover. The bookmarklet's href is set
 * after mount: React refuses to render `javascript:` URLs, and the origin is only known
 * in the browser.
 */
export default function ClipperHelp() {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    linkRef.current?.setAttribute('href', bookmarkletHref(window.location.origin));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Save from any site</CardTitle>
        <CardDescription>Found a recipe while browsing? Send it here to preview and save.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="font-medium">Desktop</p>
          <p className="text-muted-foreground mb-2">
            Drag this button to your bookmarks bar, then click it on any recipe page.
          </p>
          <a
            ref={linkRef}
            // Placeholder until the effect sets the real code; clicking it here does nothing.
            href="#"
            onClick={e => e.preventDefault()}
            draggable
            className="inline-flex items-center gap-2 rounded-md border bg-secondary px-3 py-1.5 font-medium cursor-grab"
            title="Drag to your bookmarks bar"
          >
            <Bookmark className="h-4 w-4" />
            Save to NomNoms
          </a>
        </div>
        <div>
          <p className="font-medium">Android</p>
          <p className="text-muted-foreground">
            Install NomNoms (browser menu → Add to Home screen), then use Share → NomNoms on a
            recipe page.
          </p>
        </div>
        <div>
          <p className="font-medium">iPhone</p>
          <p className="text-muted-foreground">
            Copy the page link and paste it into the box above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
