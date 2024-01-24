import { SourceNote } from "..";
import HitsuDisplay from "./Hitus";
import LingqDisplay from "./Lingq";
import DefaultDisplayMsg from "./default";


export default async function Display({ note }: { note: SourceNote }) {
    const source = note?.source
    if (!source) {
        return <DefaultDisplayMsg note={note} />;
    }
    switch (source) {
        case "プログラミング必須英単語600+":
            return <HitsuDisplay note={note} />;
        case "lingq":
            return <LingqDisplay note={note} />;
        default:
            return <DefaultDisplayMsg note={note} />;
    }
}