import { schedulerCard } from "@/lib/card";
import { getNoteByNid } from "@/lib/note";
import { NextRequest, NextResponse } from "next/server";
import { fixDate } from "ts-fsrs/dist/help";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const nid = searchParams.get("nid");
  if (!nid) {
    return NextResponse.json("nid not found", { status: 400 });
  }
  const data = await getNoteByNid(Number(nid));
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const nid = searchParams.get("nid");
    if (!nid) {
      return NextResponse.json("nid not found", { status: 400 });
    }
    const data = await schedulerCard(Number(nid),new Date());
    return NextResponse.json(data);
}
