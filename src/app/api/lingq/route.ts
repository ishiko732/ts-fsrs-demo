import { getLingqContext } from "@/vendor/lingq/request";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest){
    const data = await getLingqContext({language: "ja", token: request.headers.get("Authorization")??""})
    return NextResponse.json(data)
}