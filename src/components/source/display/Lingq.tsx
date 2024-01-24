import { SourceNote } from "..";

export default async function DisplayMsg({ note }: { note: SourceNote }) {
    const extend = JSON.parse(note.extend as string) as Partial<Lingq>;
    const fragment = extend.fragment!!;
    const tags = extend.tags;
    const words = extend.words;
    const hints = extend.hints;

    return (
        <div className="item-center sm:w-3/4">
            <div className="w-full">
                <span className="flex justify-center items-center text-2xl">
                    {note.question}
                    <span className="badge">{note.answer}</span>
                </span>
                <div className="flex justify-center flex-col items-center text-sm opacity-60">
                    <div>
                        {tags?.map((tag) => <span key={tag} className="badge">{tag}</span>)}
                        {words?.map((word) => <span key={word} className="badge badge-ghost">{word}</span>)}
                    </div>
                    <div><HighlightedWord text={fragment} word={note.question} /></div>
                </div>
            </div>
            <div className="pt-4">
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
        </div>
    );
}

export function HighlightedWord({ text, word }: { text: string, word: string }) {
    const parts = text.split(new RegExp(`(${word})`, 'gi'));

    return (
        <span>
            {parts.map((part, index) =>
                part.toLowerCase() === word.toLowerCase() ? (
                    <strong key={index}>{part}</strong>
                ) : (
                    part
                )
            )}
        </span>
    );
}