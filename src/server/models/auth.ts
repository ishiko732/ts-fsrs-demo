import type { ColumnType } from 'kysely'

// Better Auth core tables. Created via the 20260416_better_auth migration and
// owned by Better Auth itself; we declare the kysely typings here so that
// session enrichment (mirroring to the legacy `users` table) can run typed
// queries against `user` / `account`.

export interface BetterAuthUserTable {
  id: string
  name: string
  email: string
  emailVerified: ColumnType<boolean, boolean | undefined, boolean | undefined>
  image: string | null
  createdAt: ColumnType<Date, Date | undefined, Date | undefined>
  updatedAt: ColumnType<Date, Date | undefined, Date | undefined>
  appUserId: number | null
  role: ColumnType<string, string | undefined, string | undefined>
}

export interface BetterAuthSessionTable {
  id: string
  userId: string
  token: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  createdAt: ColumnType<Date, Date | undefined, Date | undefined>
  updatedAt: ColumnType<Date, Date | undefined, Date | undefined>
}

export interface BetterAuthAccountTable {
  id: string
  userId: string
  accountId: string
  providerId: string
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scope: string | null
  password: string | null
  createdAt: ColumnType<Date, Date | undefined, Date | undefined>
  updatedAt: ColumnType<Date, Date | undefined, Date | undefined>
}

export interface BetterAuthVerificationTable {
  id: string
  identifier: string
  value: string
  expiresAt: Date
  createdAt: ColumnType<Date | null, Date | undefined, Date | undefined>
  updatedAt: ColumnType<Date | null, Date | undefined, Date | undefined>
}
