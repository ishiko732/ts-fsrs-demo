import { suspendCard } from "@/lib/card";
import clsx from "clsx";
import { revalidatePath } from "next/cache";
import SuspendedSubmit from "../LoadingSubmitButton";

type Props = {
  cid: Number;
  suspend: boolean;
  className?: string;
};

export default function Suspended({ cid, suspend, className }: Props) {
  const suspendAction = async () => {
    "use server";
    const data = await suspendCard(Number(cid), !suspend);
    if (data) {
      revalidatePath(`/note/${data.nid}`);
    }
  };

  return (
    <form action={suspendAction} className="flex justify-center">
      <SuspendedSubmit className={clsx("btn btn-outline",className)}>Toggle Suspended</SuspendedSubmit>
    </form>
  );
}
