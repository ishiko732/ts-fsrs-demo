'use client'
import type { SourceNote } from ".";
import { HighlightedWord } from "./display/Lingq";

export function Question({ open, note }: { open: boolean, note: SourceNote }) {
    const extend = JSON.parse(note.extend as string) as Partial<Lingq>;
    const fragment = extend.fragment!!;
    const tags = extend.tags;
    const words = extend.words;
    return (
        <div className="item-center">
            <div className="w-full">
                <span className="flex justify-center items-center text-2xl">
                    {note.question}
                    <span className="badge">{note.answer}</span>
                </span>
                <div className="flex justify-center flex-col items-center opacity-60 pt-4">
                    <div className="text-sm">
                        {tags?.map((tag) => <span key={tag} className="badge">{tag}</span>)}
                    </div>
                    {open && words ? <div className="text-sm pt-2">
                        {words?.map((word) => <span key={word} className="badge badge-ghost">{word}</span>)}
                    </div> : null}
                    <div><HighlightedWord text={fragment} word={note.question} /></div>
                </div>
            </div>
        </div>
    )
}

export function Answer({ open, note }: { open: boolean, note: SourceNote }) {
    const extend = JSON.parse(note.extend as string) as Partial<Lingq>;
    const hints = extend.hints;
    return open ? (
        <div className="pt-4 mx-auto max-w-5xl px-4">
            <ul>
                {
                    hints?.map((hint) =>
                        <li key={hint.id}>
                            <span className="badge">{hint.locale}</span>
                            {hint.text}
                        </li>
                    )
                }
            </ul>
        </div>
    ) : null;
}