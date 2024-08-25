import { getAuthSession } from "@/app/(auth)/api/auth/[...nextauth]/session";
import { getFSRSParamsByUid } from "@/lib/fsrs";
import prisma from "@/lib/prisma";
import { getLingqs } from "@lib/apps/lingq/request";
import { createEmptyCardByPrisma } from "@lib/reviews/card/fsrsToPrisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No user" }, { status: 401 });
  }
  const uid = session.user.id;
  const params = await getFSRSParamsByUid(Number(uid));
  if (!params.lingq_token) {
    return NextResponse.json({ error: "No lingq Token" }, { status: 401 });
  }
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const lang = searchParams.get("lang");
  const page = searchParams.get("page") ?? "1";
  const page_size = searchParams.get("pageSize") ?? "25";
  if (!lang) {
    return NextResponse.json({ error: "No lang" }, { status: 400 });
  }
  if (!page) {
    return NextResponse.json({ error: "No page" }, { status: 400 });
  }
  const data = await getLingqs({
    language: lang as languageCode,
    token: params.lingq_token,
    page: Number(page),
    page_size: Number(page_size),
    search_criteria: "startsWith",
    sort: "date",
    status: ["0", "1", "2", "3"],
  });
  const hash: { [key: string]: Lingq } = {};
  const collectPks = data.results.map((lingq) => {
    hash[`${lingq.pk}`] = lingq;
    return `${lingq.pk}`;
  });
  const existSourceIds = await prisma.note.findMany({
    where: {
      uid: params.uid,
      source: "lingq",
      sourceId: {
        in: collectPks,
      },
    },
    select: {
      sourceId: true,
    },
  });
  const existPks = existSourceIds
    .filter((note) => note.sourceId)
    .map((note) => note.sourceId);
  const nonExistPks = collectPks.filter((pk) => !existPks.includes(pk));
  await sync(params.uid, lang, hash, nonExistPks);
  return NextResponse.json(
    {
      existCount: existPks.length,
      nonExistCount: nonExistPks.length,
      total: data.count,
      page: Number(page),
      page_size: Number(page_size),
      pre: data.previous,
      next: data.next,
    },
    { status: 200 }
  );
}

async function sync(
  uid: number,
  lang: string,
  hash: { [key: string]: Lingq },
  pks: string[]
) {
  if (pks.length === 0) {
    return;
  }
  const fc = createEmptyCardByPrisma();
  const dates = pks.map((pk) => {
    const lingq = hash[pk];
    const question = lingq.term.replace(/\s+/g, "");
    const note = {
      uid: uid,
      question: question,
      answer: lang,
      source: "lingq",
      sourceId: pk,
      extend: JSON.stringify({
        pk: lingq.pk,
        term: question,
        fragment: lingq.fragment,
        notes: lingq.notes,
        words: lingq.words,
        hints: lingq.hints,
        tags: lingq.tags,
        transliteration: lingq.transliteration,
        lang: lang,
      }),
      card: {
        create: fc,
      },
    };
    return prisma.note.create({
      data: note,
      include: { cards: true },
    });
  });
  await prisma.$transaction(dates);
}
