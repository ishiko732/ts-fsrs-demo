import clsx from "clsx";
import DeleteSubmit from "./DeleteSubmit";
import { deleteNoteByNid, restoreNoteByNid } from "@/lib/note";
import { revalidatePath } from "next/cache";

type Props = {
  nid: number;
  cid?: number;
  deleted: boolean;
} & React.ComponentProps<"button">;
// @deprecated
export default async function DeleteNoteButton({
  nid,
  cid,
  deleted,
  ...props
}: Props) {
  const action = async (nid: number) => {
    'use server';
    const res = await deleteNoteByNid(nid);
    revalidatePath(`/note/${res.nid}`);
    return res;
  }
  const actionByNid = action.bind(null, nid);

  const restoreAction = async (nid: number, cid?: number) => {
    'use server';
    const res = await restoreNoteByNid(nid, cid);
    revalidatePath(`/note/${nid}`);
    return true;
  }
  return (
    <>
      <DeleteSubmit
        {...props}
        nid={nid}
        cid={cid}
        deleted={deleted}
        action={actionByNid}
        restoreAction={restoreAction}
        className={clsx("btn", props.className)}
      >
      </DeleteSubmit>
    </>
  );
}
