import type { Metadata } from 'next';
import PageHeader from '@/components/page-header';
import BookmarkletInstaller from '@/components/bookmarklet-installer';

export const metadata: Metadata = {
  title: 'Save to NomNoms bookmarklet',
};

export default function BookmarkletPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 pt-10 pb-8 md:pt-8">
      <PageHeader>
        <h1 className="text-4xl md:text-5xl">Save to NomNoms</h1>
      </PageHeader>

      <div className="space-y-6">
        <p className="text-muted-foreground">
          Many recipe sites (Allrecipes, Serious Eats, Food Network, Budget Bytes and others) block
          imports from our server. The bookmarklet gets around that by sending the page you&apos;re
          already looking at straight to NomNoms. Click it while viewing a recipe and it opens in
          the add form, ready to review and save.
        </p>

        <BookmarkletInstaller />

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">If it doesn&apos;t work</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Allow pop-ups for the recipe site: the bookmarklet opens NomNoms in a new tab.</li>
            <li>
              If you&apos;re signed out, sign in in the new tab. The recipe still comes through, as
              long as you leave the recipe tab open.
            </li>
            <li>Some pages have no recipe data at all. Add those manually.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
