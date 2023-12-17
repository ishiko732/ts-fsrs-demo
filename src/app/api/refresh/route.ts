import { addProgeigoNotes } from "@/lib/note";
import { ProgeigoNodeData } from "@/types";
import { NextRequest, NextResponse } from "next/server";

interface ProgeigoNode {
  id: string;
  data: ProgeigoNodeData;
}

interface RefreshData {
  version: number;
  data: {
    英単語: ProgeigoNode[];
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

  const ret = await addProgeigoNotes(dates);
  return NextResponse.json({ count:dates.length }, { status: 200 });
}
