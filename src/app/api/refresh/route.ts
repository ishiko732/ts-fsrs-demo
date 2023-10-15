import { addNote, addNotes } from "@/lib/note";
import prisma from "@/lib/prisma";
import { NodeData } from "@/types";
import { NextRequest, NextResponse } from "next/server";

interface Node {
  id: string;
  data: NodeData;
}

interface RefreshData {
  version: number;
  data: {
    英単語: Node[];
    ユーザー: any[];
    お知らせ: any[];
  };
}

export async function POST(request: NextRequest) {
  const json: Partial<RefreshData> = await request.json();
  if (!json.data) {
    return NextResponse.json("invaild data", { status: 400 });
  }
  const { version, data } = json;
  const dates = data.英単語.map((node) => node.data);

  const ret = await addNotes(dates);
  return NextResponse.json({ count:dates.length }, { status: 200 });
}
