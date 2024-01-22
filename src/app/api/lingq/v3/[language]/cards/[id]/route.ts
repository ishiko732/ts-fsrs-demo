import { changeLingqStatus, getLingq } from "@/vendor/lingq/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {params}: { params: { language: string,id:string }}
) {
  const token = request.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "token not found" }, { status: 401 });
  }
  const data = await getLingq({
    language: params.language as languageCode,
    id: Number(params.id),
    token,
  });
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  {params}: { params: { language: string,id:string }}
) {
  const token = request.headers.get("authorization");
  const formData = await request.json();
  const status = formData["status"] as unknown as LingqStatus;
  const extended_status = formData["extended_status"] as unknown as LingqExtendedStatus;
  if (!token) {
    return NextResponse.json({ error: "token not found" }, { status: 401 });
  }
  const data = await changeLingqStatus({
    language: params.language as languageCode,
    id: Number(params.id),
    token,
    status,
    extended_status,
  });
  return NextResponse.json(data);
}
