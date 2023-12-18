import { addProgeigoNotes } from "@/lib/note";
import { ProgeigoNodeData } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { options } from "@/auth/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

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
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json("invaild session", { status: 401 });
  }
  const { version, data } = json;
  const dates = data.英単語.map((node) => node.data);
  const user = await prisma.user.findFirst({
    where: {
      oauthId: session.user.id.toString(),
      oauthType: "github",
    },
  });
  if (!user) {
    return NextResponse.json("invaild user", { status: 401 });
  }
  const ret = await addProgeigoNotes(user.uid, dates);
  return NextResponse.json({ count: dates.length }, { status: 200 });
}
