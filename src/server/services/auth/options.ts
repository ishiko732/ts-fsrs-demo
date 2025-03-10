import CredentialsProvider from '@auth/core/providers/credentials'
import GitHub, { type GitHubProfile } from '@auth/core/providers/github'
import { waitUntil } from '@vercel/functions'
import * as bcrypt from 'bcrypt'
import type { NextAuthConfig } from 'next-auth'
import type { Provider } from 'next-auth/providers'

import type { UserCreatedRequired } from '@/types'

import { initData } from '../scheduler/init'
import userService from '../users'

export function getProviders(): Provider[] {
  const providers: Provider[] = []
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV
  const github = GitHub({
    async profile(profile: GitHubProfile) {
      const userCreatedRequired: UserCreatedRequired = {
        name: !profile.name ? profile.login : profile.name,
        email: profile.email ?? '',
        oauthId: profile.id.toString(),
        oauthType: 'github',
        password: '',
      }
      const { user, isNew } = await userService.createUser(userCreatedRequired)
      if (isNew) {
        waitUntil(initData(user.id))
      }
      const role =
        profile.id === (Number(process.env.GITHUB_ADMIN_ID) ?? 62931549) // ishiko732 GitHub_Id=62931549
          ? 'admin'
          : 'user'
      Object.assign(profile, {
        id: user.id.toString(),
        name: user.name,
        image: profile.avatar_url,
        role: role,
        email: user.email,
        userKey: `${role} ${user.id}`,
      })
      return profile as Record<string, unknown>
    },
    clientId: process.env.GITHUB_ID as string,
    clientSecret: process.env.GITHUB_SECRET as string,
  }) as Provider

  providers.push(github)

  if (env !== 'production') {
    providers.push(
      CredentialsProvider({
        id: 'custom-login',
        name: 'Dev',
        credentials: {
          email: {
            label: '[dev]email',
            type: 'email',
            value: 'test@gmail.com',
          },
          username: {
            label: '[dev]username',
            type: 'text',
            value: 'DevUser',
          },
          password: {
            label: '[dev]password',
            type: 'password',
            value: '123',
          },
        },
        async authorize(profile) {
          // Only proceed if profile exists
          if (!profile) {
            return null
          }

          // Add explicit type casting to handle the unknown type
          const email = profile.email as string
          const username = profile.username as string
          const password = profile.password as string

          // This is where you need to retrieve user data
          // to verify with credentials
          // Docs: https://next-auth.js.org/configuration/providers/credentials
          const hashedPassword = await bcrypt.hash(password, 10)

          const userCreatedRequired: UserCreatedRequired = {
            name: username,
            email: email,
            oauthId: '',
            oauthType: 'dev',
            password: hashedPassword,
          }

          // const user = await initUser(userCreatedRequired)
          const { user, isNew } = await userService.createUser(userCreatedRequired)
          if (isNew) {
            waitUntil(initData(user.id))
          }
          if (user && (await bcrypt.compare(password, user.password))) {
            return {
              id: user.id.toString(),
              name: user.name,
              image: 'https://avatars.githubusercontent.com/u/96821265?v=4',
              role: 'admin',
              email: user.email,
              userKey: `admin ${user.id}`,
            }
          }
          return null
        },
      }) as Provider,
    )
  }
  return providers
}

export const options: NextAuthConfig = {
  // debug: process.env.NODE_ENV !== "production",
  providers: getProviders(),
  callbacks: {
    // Ref: https://authjs.dev/guides/basics/role-based-access-control#persisting-the-role
    async jwt({ token, user }) {
      if (user) {
        token.userKey = user.userKey
      }
      return token
    },
    // If you want to use the role in client components
    async session({ session, token }) {
      if (session?.user) {
        session.user.userKey = token.userKey
        if (token.userKey) {
          const [role, id] = token.userKey.split(' ')
          session.user.role = role
          session.user.id = id
        }
      }
      return session
    },
  },
}
