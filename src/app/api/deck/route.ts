import { getSessionUserId } from "@/app/(auth)/api/auth/[...nextauth]/session";
import { DeckService } from "@/lib/deck";
import { NextResponse } from "next/server";

export async function GET() {
    const uid = await getSessionUserId();
    if (!uid) {
        return NextResponse.json({ msg: 'uid not found' }, { status: 401 });
    }
    const deckService = new DeckService();
    const fsrs = await deckService.getAlgorithm(uid)
    const deckContext = await deckService.getTodayMemoryContext(uid, "UTC", 4)
    return NextResponse.json(deckContext, { status: 200 })
}