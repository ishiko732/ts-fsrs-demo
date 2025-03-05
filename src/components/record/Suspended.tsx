import { suspendCard } from "@/actions/userCardService";
import { cn } from "@/lib/utils";

import SuspendedSubmit from "../LoadingSubmitButton";

type Props = {
  cid: number;
  suspend: boolean;
  className?: string;
};

export default function Suspended({ cid, suspend, className }: Props) {
  const suspendAction = suspendCard.bind(null, Number(cid), !suspend);

  return (
    <form action={suspendAction} className="flex justify-center">
      <SuspendedSubmit className={cn(className)}>Toggle Suspended</SuspendedSubmit>
    </form>
  );
}
