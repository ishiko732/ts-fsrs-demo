'use client'
import { useCardContext } from "@/context/CardContext"

export default function DSRDisplay() {
    const { DSR, open } = useCardContext();
    return DSR && !open ? (
        <div className="flex justify-center opacity-15 flex-col text-left mx-auto">
            <div>{`D : ${DSR.D.toFixed(2)}`}</div>
            <div>{`S : ${DSR.S.toFixed(2)}`}</div>
            <div>{`R : ${DSR.R}`}</div>
        </div>
    ) : null
}