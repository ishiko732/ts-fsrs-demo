import { StateBox } from "@/vendor/fsrsToPrisma/handler";
import { Note, Card } from "@prisma/client";
import { startTransition, useEffect } from "react";
import { State, fixDate } from "ts-fsrs";
import { useRouter } from "next/navigation";
import { CardBoxes } from "./useCardBoxes";

const checkFinished = (
  noteBox: { [key in StateBox]: Array<Note & { card: Card }> },
  currentType: StateBox
) => {
  let current: StateBox = currentType;
  let i = 0;
  for (; i < 3; i++) {
    if (noteBox[current].length > 0) {
      if (current === State.Learning) {
        const due = fixDate(noteBox[current][0].card.due);
        if (due.getTime() - new Date().getTime() > 0) {
          break;
        }
      }
      break;
    }
    current = (current + 1) % 3;
  }
  return {
    finished: i === 3,
    transferState: current,
  };
};

export function useFinished({
  noteBox,
  currentType,
  setCurrentType,
}: CardBoxes) {
  const router = useRouter();
  useEffect(() => {
    const { finished, transferState } = checkFinished(noteBox, currentType);
    if (finished) {
      router.refresh();
      console.log("ok");
    }
    if (transferState !== currentType) {
      startTransition(() => {
        setCurrentType(transferState);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteBox, currentType]);
}
