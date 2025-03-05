'use client'
import { State } from "ts-fsrs";

import { useCardContext } from "@/context/CardContext"

export default function DSRDisplay() {
    const { DSR, open, currentType } = useCardContext();
    return DSR && !open && currentType === State.Review ? (
        <div className="flex justify-center opacity-15 flex-col text-left mx-auto">
            <div>{`D : ${DSR.D.toFixed(2)}`}</div>
            <div>{`S : ${DSR.S}`}</div>
            <div>{`R : ${DSR.R}`}</div>
        </div>
    ) : null
}