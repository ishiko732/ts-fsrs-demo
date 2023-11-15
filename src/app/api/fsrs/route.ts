import { forgetCard, rollbackCard, schedulerCard, updateCard } from "@/lib/card";
import { getNoteByNid } from "@/lib/note";
import { NextRequest, NextResponse } from "next/server";
import { Grade, Rating } from "ts-fsrs";

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
    const cid = searchParams.get("cid");
    if (!nid && !cid) {
      return NextResponse.json("nid/cid not found", { status: 400 });
    }
    const data = await schedulerCard({
      cid:cid?Number(cid):undefined,
      nid:nid?Number(nid):undefined
    },new Date());
    return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const nid = searchParams.get("nid");
  const cid = searchParams.get("cid");
  const grade = searchParams.get("grade");
  const rollback = searchParams.get("rollback");
  const reset = searchParams.get("reset");
  if (!nid && !cid) {
    return NextResponse.json("nid/cid not found", { status: 400 });
  }

  if (rollback&& Boolean(Number(rollback))){ // rollback
    const preState = await rollbackCard({
      cid:cid?Number(cid):undefined,
      nid:nid?Number(nid):undefined
    });
    return NextResponse.json({code:0,next:preState});
  }
  if (!grade&&!isNaN(Number(grade))) {
    return NextResponse.json("grade not found", { status: 400 });
  }
  if(!cid){
    return NextResponse.json("cid not found", { status: 400 });
  }
  let data;
  if(Rating.Manual === Number(grade) as Rating){ // forget
    data = await forgetCard(Number(cid),new Date(),Boolean(reset));
  }else{
    data = await updateCard(Number(cid),new Date(),Number(grade) as Grade);
  }

  return NextResponse.json({code:0,...data});
}
