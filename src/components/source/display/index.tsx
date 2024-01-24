import { SourceNote } from "..";
import HitsuDisplay from "./Hitus";
import DefaultDisplayMsg from "./default";


export default async function Display({ note }: { note: SourceNote }) {
    switch (note.source) {
        case "プログラミング必須英単語600+":
            return <HitsuDisplay note={note} />;
        default:
            return <DefaultDisplayMsg note={note} />;
    }
}