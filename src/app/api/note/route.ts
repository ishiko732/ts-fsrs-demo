import { addNote } from "@/lib/note";
import { NodeData } from "@/types";
import { NextRequest, NextResponse } from "next/server";

interface Node {
  id: string;
  data: NodeData;
}

export async function POST(request: NextRequest) {
  const json: Partial<NodeData> = await request.json();
  if (!json.answer || !json.answer) {
    return NextResponse.json("question/answer invaild data", { status: 400 });
  }
  const ret = await addNote(json);
  return NextResponse.json({ count: 1 }, { status: 200 });
}