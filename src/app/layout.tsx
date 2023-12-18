import "./globals.css";
import type { Metadata } from "next";
import AuthProvider from "@/context/AuthProvider";
import { options } from "@/auth/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import UserBar from "@/auth/components/UserBar";

export const metadata: Metadata = {
  title: 'ts-fsrs demo',
  description: 'Interval Repeat Flashcard Demo with Basic Simple Features Designed based on Next.js App Router, ts-fsrs, and Prisma.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(options);
  return (
    <html lang="en">
      <body>
        <AuthProvider>
               <UserBar user={session?.user} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
