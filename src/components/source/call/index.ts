import type { changeResponse } from "@/context/CardContext";

import { SourceNote } from "..";
import LingqCallHandler from "./Lingq";

export default async function handler(
  note: SourceNote,
  res: changeResponse
): Promise<void> {
  const source = note?.source;
  if (!source) {
    return;
  }
  switch (source) {
    case "lingq":
        return LingqCallHandler(note, res);
    default:
  }
}
