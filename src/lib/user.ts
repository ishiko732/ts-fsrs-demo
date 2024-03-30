import prisma from "./prisma";

export async function userIsExist(uid: number) {
  const user = await prisma.user.count({
    where: {
      uid,
    },
  });
  return user > 0;
}

export async function getUserByUid(uid: number) {
  return prisma.user.findFirst({
    where: {
      uid,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email,
      oauthId: "",
    },
  });
}

export async function getUserByOauthId({
  oauthId,
  oauthType,
}: {
  oauthId: string;
  oauthType: string;
}) {
  return prisma.user.findFirst({
    where: {
      oauthId,
      oauthType,
    },
  });
}
