import type { changeResponse } from "@/context/CardContext";
import { SourceNote } from "..";
import { State, date_diff, fixDate } from "ts-fsrs";

export default async function LingqCallHandler(
  note: SourceNote,
  res: changeResponse
) {
  const sourceId = Number(note.sourceId);
  const language = JSON.parse(note.extend as string)["lang"];

  if (!sourceId || !language || !window) {
    return;
  }

  const { nextState, nextDue } = res;
  let status = 0;
  let extended_status = 0;
  if (nextState != State.Review) {
    status = 0; // LingqStatus.New;
    extended_status = 0; //LingqExtendedStatus.Learning;
  } else if (nextDue) {
    const now = new Date();
    const diff = date_diff(fixDate(nextDue), now, "days");
    //Ref https://github.com/thags/lingqAnkiSync/issues/34
    if (diff > 15) {
      status = 3; // LingqStatus.Learned;
      extended_status = 3; // LingqExtendedStatus.Known;
    } else if (diff > 7 && diff <= 15) {
      status = 3; // LingqStatus.Learned;
      extended_status = 0; //LingqExtendedStatus.Learning;
    } else if (diff > 3 && diff <= 7) {
      status = 2; // LingqStatus.Familiar;
      extended_status = 0; // LingqExtendedStatus.Learning;
    } else {
      status = 1; // LingqStatus.Recognized;
      extended_status = 0; // LingqExtendedStatus.Learning;
    }
  }

  const token = await getLingqToken();
  if (token) {
    const formData = new FormData();
    formData.append("status", status.toString());
    formData.append("extended_status", extended_status.toString());
    await fetch(`/api/lingq/v3/${language}/cards/${sourceId}`, {
      method: "PATCH",
      headers: {
        Authorization: token,
        noteId: note.nid.toString(),
      },
      body: formData,
    });
  }
}

async function getLingqToken() {
  const globalForLingqToken = window as unknown as { lingqToken?: string };
  const token = globalForLingqToken.lingqToken;
  if (!token) {
    const key = await fetch("/api/lingq/key", {
      method: "POST",
    }).then((res) => res.json());
    if (!key.lingqKey) {
      globalForLingqToken.lingqToken = key.lingqKey;
    }
    return globalForLingqToken.lingqToken;
  }
  return token;
}
