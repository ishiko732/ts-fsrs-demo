import {addNote, addNotes} from "@/lib/note";

import prisma from "@/lib/prisma";
import { NodeData } from "@/types";
import { NextRequest, NextResponse } from "next/server";

interface Node {
  id: string;
  data: NodeData;
}

export async function POST(request: NextRequest) {

  const json: Partial<NodeData> = await request.json();
  if (!json.意味) {
    return NextResponse.json("意味 invaild data", { status: 400 });
  }
  if (!json.英単語) {
    return NextResponse.json(" 英単語 invaild data", { status: 400 });
  }
  const ret = await addNote(json);
  return NextResponse.json({ count:1 }, { status: 200 });
}