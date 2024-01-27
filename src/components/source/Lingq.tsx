"use client";
import { useEffect, useRef, useState } from "react";
import type { SourceNote } from ".";
import { HighlightedWord, MergeTransliteration } from "./display/Lingq";
import { getLingqToken } from "./call/Lingq";
import Audio from "@/components/card/Audio";
export function Question({ open, note }: { open: boolean; note: SourceNote }) {
  const extend = JSON.parse(note.extend as string) as Partial<Lingq> & {
    lang: string;
  };
  const lang = extend.lang;
  const fragment = extend.fragment!!;
  const transliteration = extend.transliteration;
  const tags = extend.tags;
  const words = extend.words;
  const [audio, setAudio] = useState<string>();
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    setAudio(undefined);
    if ((note && lang === "ja") || lang === "en") {
      (async () => {
        const url =
          "/api/lingq/v2/tts?" +
          new URLSearchParams({
            language: lang,
            text: note.question,
          }).toString();
        const token = await getLingqToken();
        console.log(token);
        if (!token) {
          return;
        }
        const tts: LingqTTS = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }).then((res) => res.json());
        if (tts) {
          setAudio(tts.audio);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);
  return (
    <div className="item-center">
      <div className="w-full">
        <span className="flex justify-center items-center text-2xl">
          {note.question}
          <span className="badge">{note.answer}</span>
        </span>
        <div className="flex justify-center flex-col items-center opacity-60 pt-4">
          {open && transliteration && (
            <div> {<MergeTransliteration {...transliteration} />}</div>
          )}
          <div className="text-sm">
            {tags?.map((tag) => (
              <span key={tag} className="badge">
                {tag}
              </span>
            ))}
          </div>
          {open && words ? (
            <div className="text-sm pt-2">
              {words?.map((word) => (
                <span key={word} className="badge badge-ghost">
                  {word}
                </span>
              ))}
            </div>
          ) : null}
          <div>
            <HighlightedWord text={fragment} word={note.question} />
          </div>
          {audio && (
            <Audio
              url={audio}
              ref={audioRef}
              onCanPlay={(e) => {
                audioRef.current?.play();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
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