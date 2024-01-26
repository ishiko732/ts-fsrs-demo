import { getAuthSession } from "@/app/(auth)/api/auth/[...nextauth]/session";
import { changeLingqStatus, getLingq } from "@/vendor/lingq/request";
import { updateNoteByLingq } from "@/vendor/lingq/sync";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { language: string, id: string } }
) {
  const token = request.headers.get("Authorization");
  if (!token) {
    return NextResponse.json({ error: "token not found" }, { status: 401 });
  }
  const data = await getLingq({
    language: params.language as languageCode,
    id: Number(params.id),
    token,
  });
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { language: string, id: string } }
) {
  const token = request.headers.get("authorization");
  const formData = await request.formData();
  const status = Number(formData.get("status")) as LingqStatus;
  const extended_status = Number(formData.get("extended_status")) as LingqExtendedStatus;
  if (!token) {
    return NextResponse.json({ error: "token not found" }, { status: 401 });
  }
  const data = await changeLingqStatus({
    language: params.language as languageCode,
    id: Number(params.id),
    token,
    status,
    extended_status,
  });
  const nid = request.headers.get("noteId");
  if (nid && !isNaN(Number(nid))) {
    await updateNote(Number(nid), data)
  }
  return NextResponse.json(data);
}


async function updateNote(nid: number, data: Lingq) {
  const session = await getAuthSession();
  if (!session || !session.user) {
    return
  }
  return updateNoteByLingq(Number(session.user.id), nid, data);
}