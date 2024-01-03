"use client";

import { useCardContext } from "@/context/CardContext";

export default function RollbackButton() {
  const { rollbackAble, handleRollBack } = useCardContext();

  return rollbackAble ? (
    <button
      className="btn fixed bottom-0 inset-x-0 flex justify-center items-center bg-gray-200 tooltip tooltip-top sm:hidden"
      onClick={async () => {
        await handleRollBack();
      }}
      data-tip="Press Ctrl+Z(⌘+Z) to rollback"
    >
      Rollback
    </button>
  ) : null;
}
