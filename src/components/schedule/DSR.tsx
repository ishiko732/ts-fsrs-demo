'use client'
import { useCardContext } from "@/context/CardContext"
import { State } from "ts-fsrs";

export default function DSRDisplay() {
    const { DSR, open, currentType } = useCardContext();
    return DSR && !open && currentType === State.Review ? (
        <div className="flex justify-center opacity-15 flex-col text-left mx-auto">
            <div>{`D : ${DSR.D.toFixed(2)}`}</div>
            <div>{`S : ${DSR.S.toFixed(2)}`}</div>
            <div>{`R : ${DSR.R}`}</div>
        </div>
    ) : null
}