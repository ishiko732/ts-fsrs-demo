import { getLingqs } from "@/vendor/lingq/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ language: string }> }) {
  const params = await props.params;
  const url = new URL(request.url);
  const page_size = url.searchParams.get("page_size");
  const page = url.searchParams.get("page");
  const token = request.headers.get("Authorization");
  const search_criteria = url.searchParams.get("search_criteria") ?? undefined;
  const sort = url.searchParams.get("sort") ?? undefined;
  const status = url.searchParams.getAll("status");
  if (!token) {
    return NextResponse.json({ error: "token not found" }, { status: 401 });
  }
  const data = await getLingqs({
    language: params.language as languageCode,
    page_size: page_size ? Number(page_size) : undefined,
    page: page ? Number(page) : undefined,
    search_criteria,
    sort,
    status: status.length > 0 ? status : undefined,
    token,
  });
  return NextResponse.json(data);
}
