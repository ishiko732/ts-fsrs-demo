'use client'
import { useCardContext } from "@/context/CardContext";
import { Answer as DefaultAnswer, Question as DefaultQuestion, DisplayMsg as DefaultDisplayMsg } from "./default";
import { Card, Note } from "@prisma/client";
import { HitsuAnswer, HitsuDisplay } from "./Hitsu";
export function Question() {
    const { currentType, noteBox } = useCardContext();
    const note = noteBox[currentType][0];
    return (
        <DefaultQuestion note={note} />
    )
}

export function Answer() {
    const { open, currentType, noteBox } =
        useCardContext();
    const note = noteBox[currentType][0];
    switch (note.source) {
        case "プログラミング必須英単語600+":
            return <HitsuAnswer open={open} note={note} />;
        default:
            return <DefaultAnswer open={open} note={note} />;
    }
}

export function DisplayMsg({ note }: { note: SourceNote }) {
    switch (note.source) {
        case "プログラミング必須英単語600+":
            return <HitsuDisplay note={note} />;
        default:
            return <DefaultDisplayMsg note={note} />;
    }
}

export function QACard() {
    return (
        <>
            <Question />
            <Answer />
        </>
    );
}
export type SourceNote = Note & { card: Card }