import { getLingqs } from "@/vendor/lingq/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {params}: { params: { language: string }}
) {
  const url = new URL(request.url);
  const page_size = url.searchParams.get("page_size");
  const page = url.searchParams.get("page");
  const token = request.headers.get("Authorization");
  if (!token) {
    return NextResponse.json({ error: "token not found" }, { status: 401 });
  }
  console.log(url.toString())
  const data = await getLingqs({
    language: params.language as languageCode,
    page_size: page_size ? Number(page_size) : undefined,
    page: page ? Number(page) : undefined,
    token,
  });
  return NextResponse.json(data);
}
