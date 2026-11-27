'use client';

import { useEffect, useRef, useState } from 'react';
import { BookmarkPlus, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { bookmarkletHref } from '@/lib/bookmarklet';

export default function BookmarkletInstaller() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [href, setHref] = useState('');
  const [copied, setCopied] = useState(false);

  // Built from the current origin so preview deployments get their own bookmarklet.
  // Set through the DOM: React refuses `javascript:` URLs in JSX attributes.
  useEffect(() => {
    const value = bookmarkletHref(window.location.origin);
    setHref(value);
    linkRef.current?.setAttribute('href', value);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: nothing to do; the drag option still works on desktop.
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-lg font-semibold">On a computer</h2>
          <p className="text-sm text-muted-foreground">
            Show your bookmarks bar (Ctrl+Shift+B, or ⌘+Shift+B on a Mac), then drag this button
            onto it:
          </p>
          <a
            ref={linkRef}
            onClick={e => e.preventDefault()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground cursor-grab"
            title="Drag me to your bookmarks bar"
          >
            <BookmarkPlus className="h-4 w-4" />
            Save to NomNoms
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-lg font-semibold">On iPhone or iPad (Safari)</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Copy the bookmarklet code.</li>
            <li>Bookmark any page (Share → Add Bookmark) and name it “Save to NomNoms”.</li>
            <li>Open your bookmarks, tap Edit, edit that bookmark and paste the code as its address.</li>
          </ol>
          <Button variant="outline" onClick={copy} disabled={!href}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied' : 'Copy bookmarklet code'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
