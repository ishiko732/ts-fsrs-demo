import 'server-only'
import { db } from '@libs/db'
import envSchema from '@server/env'
import { initData } from '@services/scheduler/init'
import userService from '@services/users'
import { waitUntil } from '@vercel/functions'
import { headers as nextHeaders } from 'next/headers'

import { auth } from './auth'

export type Role = 'admin' | 'user'

export interface AppSessionUser {
  /** Better Auth user id (UUID-ish string). */
  id: string
  /** Numeric id of the matching row in the legacy `users` table. */
  appUserId: number
  name: string
  email: string
  image: string | null
  role: Role
  /** Backwards-compatible composite key: `${role} ${appUserId}`. */
  userKey: string
}

export interface AppSession {
  user: AppSessionUser
}

type RawBetterAuthSession = Awaited<ReturnType<typeof auth.api.getSession>>

async function enrichSession(
  raw: RawBetterAuthSession
): Promise<AppSession | null> {
  if (!raw?.user) return null

  const baseUser = raw.user as typeof raw.user & {
    appUserId?: number | null
    role?: string | null
  }

  let appUserId = baseUser.appUserId ?? null
  let role = (baseUser.role as Role | null) ?? null

  if (!appUserId || !role) {
    const enriched = await mirrorToLegacyUser(baseUser.id)
    appUserId = enriched.appUserId
    role = enriched.role
  }

  return {
    user: {
      id: baseUser.id,
      appUserId,
      name: baseUser.name,
      email: baseUser.email,
      image: baseUser.image ?? null,
      role,
      userKey: `${role} ${appUserId}`,
    },
  }
}

export async function getAuthSession(): Promise<AppSession | null> {
  const headers = await nextHeaders()
  const raw = await auth.api.getSession({ headers })
  return enrichSession(raw)
}

export async function getAuthSessionFromHeaders(
  headers: Headers
): Promise<AppSession | null> {
  const raw = await auth.api.getSession({ headers })
  return enrichSession(raw)
}

// Lazy mirror: when a Better Auth user has no `appUserId` yet (their first
// authenticated request), look up / create the matching legacy `users` row
// and persist the linkage on the Better Auth user record.
async function mirrorToLegacyUser(authUserId: string) {
  const account = await db
    .selectFrom('account')
    .selectAll()
    .where('userId', '=', authUserId)
    .executeTakeFirst()

  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('id', '=', authUserId)
    .executeTakeFirstOrThrow()

  const provider = account?.providerId ?? 'credential'
  const oauthType = provider === 'github' ? 'github' : 'dev'
  const oauthId = account?.accountId ?? authUserId

  const { user: legacy, isNew } = await userService.createUser({
    name: user.name,
    email: user.email,
    oauthId,
    oauthType,
    password: '',
  })

  const role: Role =
    oauthType === 'github'
      ? Number(oauthId) === envSchema.GITHUB_ADMIN_ID
        ? 'admin'
        : 'user'
      : 'admin'

  await db
    .updateTable('user')
    .set({ appUserId: legacy.id, role })
    .where('id', '=', authUserId)
    .execute()

  if (isNew) {
    waitUntil(initData(legacy.id))
  }

  return { appUserId: legacy.id, role }
}

export async function isAdmin() {
  const session = await getAuthSession()
  return session?.user?.role === 'admin'
}

export async function isSelf(uid: number) {
  const session = await getAuthSession()
  return session?.user?.appUserId === uid
}

export async function isAdminOrSelf(uid: number) {
  const session = await getAuthSession()
  if (!session) return false
  return session.user.role === 'admin' || session.user.appUserId === uid
}

export async function getSessionUserId() {
  const session = await getAuthSession()
  return session?.user?.appUserId ?? null
}

export async function getSessionUserIdThrow() {
  const uid = await getSessionUserId()
  if (!uid) {
    throw new Error('user not found.')
  }
  return uid
}
