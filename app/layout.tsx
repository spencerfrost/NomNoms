import type { Metadata } from 'next';
import { Bagel_Fat_One, Onest } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/auth-provider';
import BottomNav from '@/components/bottom-nav';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { env } from '@/lib/env';
import { SITE_DESCRIPTION, SITE_NAME, siteOpenGraph } from '@/lib/site-metadata';

const display = Bagel_Fat_One({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
});

const body = Onest({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  // Resolves relative URLs in page metadata (e.g. seed images under /images) to absolute
  // ones, which Open Graph previews require.
  metadataBase: new URL(env.NEXTAUTH_URL),
  title: {
    default: 'NomNoms Recipe Manager',
    template: '%s | NomNoms',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // The share image comes from app/opengraph-image.tsx; Next adds og:image and
  // twitter:image tags for it automatically.
  openGraph: {
    ...siteOpenGraph,
    type: 'website',
    url: '/',
    title: 'NomNoms Recipe Manager',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${display.variable} ${body.variable} antialiased relative min-h-screen bg-background text-foreground font-body pb-28 md:pb-0`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
