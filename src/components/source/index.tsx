'use client'
import { useCardContext } from "@/context/CardContext";
import { Question as DefaultQuestion, Answer as DefaultAnswer } from "./default";
import { Card, Note } from "@prisma/client";
import { HitsuAnswer } from "./Hitsu";
import { Question as LingqQuestion, Answer as LingqAnswer } from "./Lingq";

export function Question({ open, note }: { open: boolean, note: SourceNote }) {
    const source = note?.source
    if (!source) {
        return <DefaultQuestion note={note} />;
    }
    switch (source) {
        case "lingq":
            return <LingqQuestion open={open} note={note} />;
        default:
            return <DefaultQuestion note={note} />;
    }
}

export function Answer({ open, note }: { open: boolean, note: SourceNote }) {
    const source = note?.source
    if (!source) {
        return <DefaultAnswer open={open} note={note} />;
    }
    switch (source) {
        case "プログラミング必須英単語600+":
            return <HitsuAnswer open={open} note={note} />;
        case "lingq":
            return <LingqAnswer open={open} note={note} />;
        default:
            return <DefaultAnswer open={open} note={note} />;
    }
}


export function QACard() {
    const { open, currentType, noteBox } =
        useCardContext();
    const note = noteBox[currentType][0];
    return (
        <>
            <Question open={open} note={note} />
            <Answer open={open} note={note} />
        </>
    );
}
export type SourceNote = Note & { card: Card }