'use client'
import { Card, Note } from "@prisma/client";

import { useCardContext } from "@/context/CardContext";

import { Answer as DefaultAnswer,Question as DefaultQuestion } from "./default";
import { HitsuAnswer } from "./Hitsu";
import { Answer as LingqAnswer,Question as LingqQuestion } from "./Lingq";

export function Question({ open, note }: { open: boolean, note: SourceNote }) {
    switch (note.source) {
        case "lingq":
            return <LingqQuestion open={open} note={note} />;
        default:
            return <DefaultQuestion note={note} />;
    }
}

export function Answer({ open, note }: { open: boolean, note: SourceNote }) {
    switch (note.source) {
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
    if (!note) {
        return null
    }
    return (
        <>
            <Question open={open} note={note} />
            <Answer open={open} note={note} />
        </>
    );
}