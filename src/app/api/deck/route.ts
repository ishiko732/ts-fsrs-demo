import { getSessionUserId } from "@/app/(auth)/api/auth/[...nextauth]/session";
import { DeckService } from "@/lib/deck";
import { NextResponse } from "next/server";

export async function GET() {
    const uid = await getSessionUserId();
    if (!uid) {
        return null;
    }
    const deckService = new DeckService();
    const fsrs = await deckService.getAlgorithm(uid)
    const deckContext = await deckService.getTodayMemoryContext(uid, "Asia/Shanghai", 4)
    return NextResponse.json(deckContext)
}