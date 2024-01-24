import { SourceNote } from "..";

export default async function DisplayMsg({ note }: { note: SourceNote }) {
    return (
        <div className="pt-4 mx-auto max-w-5xl px-4">
            <div>Default</div>
        </div>
    );
}