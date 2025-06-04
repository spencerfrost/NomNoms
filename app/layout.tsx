import type { Metadata } from "next";
import { Marcellus, Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import BackgroundGradient from "@/components/background-gradient";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const marcellus = Marcellus({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "🍽️ NomNoms - Personal Recipe Manager",
  description: "Your personal recipe collection. Search, scale, and manage your favorite recipes.",
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
        className={`${marcellus.variable} ${poppins.variable} antialiased relative min-h-screen text-foreground font-body`}
      >
        <BackgroundGradient />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
