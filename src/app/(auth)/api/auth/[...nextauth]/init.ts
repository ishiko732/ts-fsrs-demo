import prisma from "@/lib/prisma";
import { GithubProfile } from "next-auth/providers/github";

export function findOauthUser(profile: GithubProfile) {
  return prisma.user.findFirst({
    where: {
      oauthId: profile.id.toString(),
      oauthType: "github"
    },
  });
}   