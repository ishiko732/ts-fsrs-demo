import prisma from "@/lib/prisma";
import {
  default_enable_fuzz,
  default_maximum_interval,
  default_request_retention,
  default_w,
} from "ts-fsrs";
import progeigo from "@/../public/プログラミング必須英単語600+.json" assert { type: "json" };
import { initProgeigoNotes } from "@/lib/note";
import { ProgeigoNodeData, UserCreatedRequired } from "@/types";
import { getUserByEmail, getUserByOauthId } from "@/lib/user";
import { User, Parameters } from "@prisma/client";

// init user and fsrs config
export async function initUserAndFSRS(
  profile: UserCreatedRequired
): Promise<Parameters & { user: User }> {
  const params: Parameters & { user: User | null } =
    await prisma.parameters.create({
      data: {
        request_retention: default_request_retention,
        maximum_interval: default_maximum_interval,
        w: JSON.stringify(default_w),
        enable_fuzz: default_enable_fuzz,
        user: {
          create: {
            name: profile.name,
            password: profile.password,
            email: profile.email,
            oauthId: profile.oauthId,
            oauthType: profile.oauthType,
          },
        },
      },
      include: {
        user: true,
      },
    });
  if (!params.user) {
    throw new Error("user not found");
  }
  return params as Parameters & { user: User };
}

// init progeigo dates
export async function initProgeigoDates(uid: number) {
  console.log("init dates");
  const dates: ProgeigoNodeData[] = progeigo.data.英単語.map(
    (node) => node.data
  ) as ProgeigoNodeData[];
  return initProgeigoNotes(uid, dates.slice(0, 60));
}

// find or init user
export async function initUser(profile: UserCreatedRequired) {
  let user: User | null = null;
  if (profile.oauthType) {
    user = await getUserByOauthId({
      oauthId: profile.oauthId,
      oauthType: profile.oauthType,
    });
  } else {
    user = await getUserByEmail(profile.email);
  }
  if (!user) {
    const params = await initUserAndFSRS(profile);
    user = params.user;
    await initProgeigoDates(user.uid);
  }
  return user;
}
