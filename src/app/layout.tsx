import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ts-fsrs demo',
  description: 'Interval Repeat Flashcard Demo with Basic Simple Features Designed based on Next.js App Router, ts-fsrs, and Prisma.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body >{children}</body>
    </html>
  )
}
