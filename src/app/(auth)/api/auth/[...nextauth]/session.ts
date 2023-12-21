import { options } from "@/auth/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import type { User } from "next-auth";

type SessionProps = {
    expires: string;
    user?: User;
};

export async function getAuthSession() {
    const session = await getServerSession(options);
    return session as SessionProps | null;
}


export async function isAdmin() {
    const session = await getAuthSession();
    return session?.user?.role === "admin";
}

export async function isSelf(uid: number) {
    const session = await getAuthSession();
    return session?.user?.id === String(uid);
}

export async function isAdminOrSelf(uid: number) {
    const session = await getAuthSession();
    return session?.user?.role === "admin" || session?.user?.id === String(uid);
}