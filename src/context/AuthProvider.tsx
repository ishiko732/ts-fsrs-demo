import { AuthHandler } from '@server/services/auth'
import { BASE_PATH } from '@server/services/auth/options'
import { SessionProvider } from 'next-auth/react'

export default async function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = await AuthHandler()
  return (
    <SessionProvider baseUrl={BASE_PATH} session={session}>
      {children}
    </SessionProvider>
  )
}
