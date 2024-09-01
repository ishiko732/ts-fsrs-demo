import { _findCardsByUid, _reschedule } from "@/lib/reschedule";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // const url = new URL(request.url);
  // const searchParams = new URLSearchParams(url.search);
  // const uid = await getSessionUserId();
  // if (!uid) {
  //   return NextResponse.json({ error: "No user" }, { status: 401 });
  // }
  // const params = await getFSRSParamsByUid(uid);
  // if (!params) {
  //   return NextResponse.json({ error: "No params" }, { status: 400 });
  // }
  // const page = Number(searchParams.get("page") ?? "1");
  // const pageSize = Number(searchParams.get("pageSize") ?? "25");
  // const cards: Card[] = await _findCardsByUid({ uid, page, pageSize });
  // await _reschedule(params.params, cards);
  // TODO: return something useful
  return NextResponse.json({ success: false });
}
