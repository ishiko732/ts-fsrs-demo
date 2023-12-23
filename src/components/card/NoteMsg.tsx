import React from "react";
import { Card, Note } from "@prisma/client";
import Video from "@/components/card/Video";
import Audio from "@/components/card/Audio";
type Props = {
  note: {
    card: Card;
  } & Note;
};

export default async function NoteMsg({ note }: Props) {
  const extend = JSON.parse(note.extend as string);
  const 分類 = extend.分類 as string | undefined;
  const 品詞 = extend.品詞 as string | undefined;
  const 例文 = extend.例文 as string | undefined;
  const 例文訳 = extend.例文訳 as string | undefined;
  const 解説 = extend.解説 as string | undefined;
  const 発音 = extend.発音 as string | undefined;
  const ビデオ = extend.ビデオ as string | undefined;
  return (
    <div className="item-center sm:w-3/4">
      <div className="w-full">
        <span className="flex justify-center items-center text-2xl">
          {note.question}
        </span>
        <div className="flex justify-center items-center text-sm opacity-60">
          {分類 && <span>{`${分類}`}</span>}
          {分類 && 品詞 && <span>|</span>}
          {品詞 && <span>{`${品詞}`}</span>}
        </div>
      </div>
      <div className="pt-4">
        <div>意味:{note.answer}</div>
        {例文 && <div>例文:{例文}</div>}
        {例文訳 && <div>例文訳:{例文訳}</div>}
        {解説 && <div>解説:{解説}</div>}
        {発音 && <Audio url={発音} />}
        {ビデオ && <Video url={ビデオ} />}
      </div>
    </div>
  );
}
