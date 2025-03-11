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
  const [role, id] = (session?.user.userKey ?? '').split(' ')
  return role === 'admin' || id === String(uid)
}

export async function getSessionUserId() {
  const session = await AuthHandler()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, id] = (session?.user.userKey ?? '').split(' ')
  return id ? Number(session?.user?.id) : null
}

export async function getSessionUserIdThrow() {
  const uid = await getSessionUserId()
  if (!uid) {
    throw new Error('user not found.')
  }
  return uid
}
