import prisma from "@/lib/prisma";
import { GithubProfile } from "next-auth/providers/github";
import { default_enable_fuzz, default_maximum_interval, default_request_retention, default_w } from "ts-fsrs";
import progeigo from "@/../public/プログラミング必須英単語600+.json";
import { addProgeigoNotes } from "@/lib/note";
import { ProgeigoNodeData } from "@/types";

export function findOauthUser(profile: GithubProfile) {
  return prisma.user.findFirst({
    where: {
      oauthId: profile.id.toString(),
      oauthType: "github"
    },
  });
}

export async function initUserAndFSRS(profile: GithubProfile) {
  return prisma.parameters.create({
    data: {
      request_retention: default_request_retention,
      maximum_interval: default_maximum_interval,
      w: JSON.stringify(default_w),
      enable_fuzz: default_enable_fuzz,
      user: {
        create: {
          name: profile.name ?? profile.login,
          password: "",
          email: profile.email ?? "",
          oauthId: profile.id.toString(),
          oauthType: "github"
        }
      },
    }, include: {
      user: true
    }
  });
}

export async function initProgeigoDates(uid: number) {
  const dates: ProgeigoNodeData[] = progeigo.data.英単語.map((node) => node.data) as ProgeigoNodeData[];
  const ret = await addProgeigoNotes(uid, dates);

}

export async function initUser(profile: GithubProfile) {
  const user = await findOauthUser(profile);
  if (!user) {
    const _user = await initUserAndFSRS(profile);
    await initProgeigoDates(_user.uid);
    return _user;
  }
  return user;
}