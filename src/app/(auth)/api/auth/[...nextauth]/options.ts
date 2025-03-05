import * as bcrypt from 'bcrypt'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import { GithubProfile } from 'next-auth/providers/github'
import { Provider } from 'next-auth/providers/index'

import { UserCreatedRequired } from '@/types'

import { initUser } from './init'

function getProviders(): Provider[] {
  const providers: Provider[] = []
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV
  providers.push(
    GitHubProvider({
      async profile(profile: GithubProfile) {
        // console.log(profile);
        const userCreatedRequired: UserCreatedRequired = {
          name: !profile.name ? profile.login : profile.name,
          email: profile.email ?? '',
          oauthId: profile.id.toString(),
          oauthType: 'github',
          password: '',
        }
        const user = await initUser(userCreatedRequired)
        const githubProfile = {
          ...profile,
          name: user.name,
          role:
            profile.id === (Number(process.env.GITHUB_ADMIN_ID) ?? 62931549) // ishiko732 GitHub_Id=62931549
              ? 'admin'
              : 'user',
          id: user.uid.toString(),
          image: profile.avatar_url,
        }
        return githubProfile
      },
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      httpOptions: {
        timeout: 60000,
      },
    }),
  )
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
          console.log(profile)
          if (!profile) {
            return null
          }
          // This is where you need to retrieve user data
          // to verify with credentials
          // Docs: https://next-auth.js.org/configuration/providers/credentials
          const hashedPassword = await bcrypt.hash(profile.password, 10)
          const userCreatedRequired: UserCreatedRequired = {
            name: profile.username,
            email: profile.email,
            oauthId: '',
            oauthType: 'dev',
            password: hashedPassword,
          }
          const user = await initUser(userCreatedRequired)
          if (user && (await bcrypt.compare(profile.password, user.password))) {
            return {
              id: user.uid.toString(),
              name: user.name,
              image: 'https://avatars.githubusercontent.com/u/96821265?v=4',
              role: 'admin',
            }
          }
          return null
        },
      }),
    )
  }
  return providers
}

export const options: NextAuthOptions = {
  // debug: process.env.NODE_ENV !== "production",
  providers: getProviders(),
  callbacks: {
    // Ref: https://authjs.dev/guides/basics/role-based-access-control#persisting-the-role
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.sub = user.id
      }
      return token
    },
    // If you want to use the role in client components
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
        if (token.sub) session.user.id = token.sub
      }
      return session
    },
  },
}
