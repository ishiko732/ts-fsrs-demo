import { getAuthSession } from "@/app/(auth)/api/auth/[...nextauth]/session";
import { getFSRSParamsByUid } from "@/lib/fsrs";
import { NextResponse } from "next/server";

export async function GET() {
    function buf2hex(buffer:ArrayBuffer) { // buffer is an ArrayBuffer
        return Array.from(new Uint8Array(buffer))
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
    }
    const key = await crypto.subtle.generateKey(
        {
            name: "AES-CTR",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    )
    const exported = await crypto.subtle.exportKey("raw", key);
    return NextResponse.json({"key": buf2hex(exported)});
}

export async function POST(){
    const session = await getAuthSession()
    if(!session?.user){
        return NextResponse.json({error:"permission denied"},{status:403})
    }
    const uid = session.user.id
    const params = await getFSRSParamsByUid(Number(uid))
    return NextResponse.json({lingqKey:params.lingq_token})
}

