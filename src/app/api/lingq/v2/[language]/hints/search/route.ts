import { searchHints } from "@/vendor/lingq/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { language: string; hintsId: string } }
) {
  const token = request.headers.get("Authorization");
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") || "zh-cn";
  const term = url.searchParams.get("term");
  if (!token) {
    return NextResponse.json({ error: "token not found" }, { status: 401 });
  }
  if (!term) {
    return NextResponse.json({ error: "term not found" }, { status: 400 });
  }
  const data = await searchHints({
    language: params.language as languageCode,
    token,
    locale,
    term,
  });
  return NextResponse.json(data);
}
