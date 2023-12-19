import "./globals.css";
import type { Metadata } from "next";
import AuthProvider from "@/context/AuthProvider";
import { SpeedInsights } from '@vercel/speed-insights/next';

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
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
