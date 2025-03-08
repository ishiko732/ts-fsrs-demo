import { AuthHandler } from '.'

export async function getAuthSession() {
  return AuthHandler()
}

export async function isAdmin() {
  const session = await AuthHandler()
  return session?.user?.role === 'admin'
}

export async function isSelf(uid: number) {
  const session = await AuthHandler()
  return session?.user?.id === String(uid)
}

export async function isAdminOrSelf(uid: number) {
  const session = await AuthHandler()
  return session?.user?.role === 'admin' || session?.user?.id === String(uid)
}

export async function getSessionUserId() {
  const session = await AuthHandler()
  return session?.user?.id ? Number(session?.user?.id) : null
}
