import { options } from "@/auth/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";


export async function getAuthSession() {
    const session = await getServerSession(options);
    return session;
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