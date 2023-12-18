import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { GithubProfile } from "next-auth/providers/github";
import prisma from "@/lib/prisma";

export const options: NextAuthOptions = {
  // debug: process.env.NODE_ENV !== "production",
  providers: [
    GitHubProvider({
      profile(profile: GithubProfile) {
        // console.log(profile)
        const githubProfile= {
          ...profile,
          role:
            profile.id === (Number(process.env.GITHUB_ADMIN_ID) ?? 62931549)
              ? "admin"
              : "user",
          id: profile.id.toString(),
          image: profile.avatar_url,
        };

        
        return githubProfile;
      },
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    // CredentialsProvider({
    //   id: "custom-login",
    //   name: "Credentials",
    //   credentials: {
    //     username: {
    //       label: "Username or email address",
    //       type: "text",
    //     },
    //     password: {
    //       label: "Password:",
    //       type: "password",
    //     },
    //   },
    //   async authorize(credentials) {
    //     // This is where you need to retrieve user data
    //     // to verify with credentials
    //     // Docs: https://next-auth.js.org/configuration/providers/credentials
    //     console.log(credentials);
    //     const user = await prisma.user.findFirst({
    //       where: {
    //         OR: [
    //           { name: credentials?.username ?? "" },
    //           { email: credentials?.username ?? "" },
    //         ],
    //       },
    //     });
    //     console.log(user);
    //     if (user && user.password === credentials?.password) {
    //       return {
    //         id: user.uid.toString(),
    //         name: user.name,
    //         image: "https://avatars.githubusercontent.com/u/62931549?v=4",
    //         role: user.uid === 1 ? "admin" : "user",
    //       };
    //     }
    //     return null;
    //   },
    // }),
  ],
  callbacks: {
    // Ref: https://authjs.dev/guides/basics/role-based-access-control#persisting-the-role
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        console.log(user);
      }
      return token;
    },
    // If you want to use the role in client components
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role;
      return session;
    },
  },
};
