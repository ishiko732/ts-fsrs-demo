import { SourceNote } from "..";

export default async function DisplayMsg({ note }: { note: SourceNote }) {
    return (
        <div className="item-center sm:w-3/4">
            <div className="w-full">
                <span className="flex justify-center items-center text-2xl">
                    {note.question}
                </span>
            </div>
            <div className="pt-4">
                <div>{note.answer}</div>
            </div>
        </div>
    );
}