import { forgetCard } from "@/lib/card";
import { revalidatePath } from "next/cache";
import React from "react";

type Props = {
  cid: Number;
  className?: string;
};

export default function Forget({ cid, className }: Props) {
  const forgetAction = async () => {
    "use server";
    const data = await forgetCard(Number(cid), new Date(), true);
    if (data) {
      revalidatePath(`/note/${data.nid}`);
    }
  };

  return (
    <form action={forgetAction} className="flex justify-center">
      <button className={"btn " + className} type="submit">
        Forget
      </button>
    </form>
  );
}
