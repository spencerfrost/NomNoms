import { notFound } from 'next/navigation';

// Never prerender: layouts and pages render in parallel, so a static build would still
// run the debug pages' database queries at build time even though this layout 404s.
export const dynamic = 'force-dynamic';

// Debug tooling is for local development only.
export default function DebugLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return children;
}
