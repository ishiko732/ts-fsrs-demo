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


