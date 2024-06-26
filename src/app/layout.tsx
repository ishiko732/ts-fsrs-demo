import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/context/AuthProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import ThemeProvider from '@/context/ThemesProvider';
import { cn } from '@/lib/utils';
import { Inter as FontSans } from "next/font/google";
import NavBar from '@/components/nav-bar';

export const metadata: Metadata = {
  title: 'ts-fsrs demo',
  description:
    'Interval Repeat Flashcard Demo with Basic Simple Features Designed based on Next.js App Router, ts-fsrs, fsrs-browser and Prisma.',
};

// See https://ui.shadcn.com/docs/installation/next
const inter = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <meta
        name='google-site-verification'
        content='O3iry-K9HB2g3JEHQ5AJ3sd9GBSi9KzUM8nzYiBqyGM'
      />
      <body
        className={cn(
          'min-h-screen grid-rows-[min-content_1fr] bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <AuthProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <NavBar />
            {children}
            <SpeedInsights />
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
