import clsx from "clsx";
import DeleteSubmit from "./DeleteSubmit";
import { deleteNoteByNid, restoreNoteByNid } from "@/lib/note";
import { Card, Note, Revlog } from "@prisma/client";

type Props = {
  nid: number;
} & React.ComponentProps<"button">;

export default async function DeleteNoteButton({
  nid,
  ...props
}: Props) {
  const action = async (nid:number) => {
    'use server';
    const res=  await deleteNoteByNid(nid);
    return res;
  }
  const actionByNid=action.bind(null,nid);

  const restoreAction= async (note:Note,revlog: Revlog[],card?:Card)=>{
    'use server';
    const res=  await restoreNoteByNid(note,revlog,card);
    console.log(res)
    return true;
  }
  return (
    <>
      <DeleteSubmit
        {...props}
        action={actionByNid}
        restoreAction={restoreAction}
        className={clsx("btn", props.className)}
      >
      </DeleteSubmit>
    </>
  );
}
