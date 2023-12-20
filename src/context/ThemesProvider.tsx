'use client'

import { ThemeProvider } from 'next-themes'

export default function ThemesProvider({ children }: { children: React.ReactNode }) {
    return <ThemeProvider defaultTheme='system' enableSystem={true}>{children}</ThemeProvider>
}