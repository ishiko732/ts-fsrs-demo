import { getLingqs } from "@/vendor/lingq/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { language_code }: { language_code: string }
) {
  const url = new URL(request.url);
  const page_size = url.searchParams.get("page_size");
  const page = url.searchParams.get("page");
  const token = request.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "token not found" }, { status: 401 });
  }
  const data = await getLingqs({
    language: language_code as languageCode,
    page_size: page_size ? Number(page_size) : undefined,
    page: page ? Number(page) : undefined,
    token,
  });
  return NextResponse.json(data);
}
