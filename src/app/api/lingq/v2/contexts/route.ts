import { getLingqContext } from "@/vendor/lingq/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const language_code = url.searchParams.get("language_code");
  const page_size = url.searchParams.get("page_size");
  const page = url.searchParams.get("page");
  const token = request.headers.get("Authorization");
  if (!token) {
    return NextResponse.json({ error: "token not found" }, { status: 401 });
  }
  const data = await getLingqContext({
    language: language_code? language_code as languageCode: undefined,
    page_size: page_size ? Number(page_size) : undefined,
    page: page ? Number(page) : undefined,
    token,
  });
  return NextResponse.json(data);
}
