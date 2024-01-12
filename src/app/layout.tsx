import "./globals.css";
import type { Metadata } from "next";
import AuthProvider from "@/context/AuthProvider";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import ThemesProvider from "@/context/ThemesProvider";
import Drawer from "@/components/Drawer";

export const metadata: Metadata = {
  title: 'ts-fsrs demo',
  description: 'Interval Repeat Flashcard Demo with Basic Simple Features Designed based on Next.js App Router, ts-fsrs, and Prisma.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="google-site-verification" content="O3iry-K9HB2g3JEHQ5AJ3sd9GBSi9KzUM8nzYiBqyGM" />
      <body>
        <AuthProvider>
          <ThemesProvider>
            <Drawer>
              {children}
            </Drawer>
            <SpeedInsights />
            <Analytics />
          </ThemesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
