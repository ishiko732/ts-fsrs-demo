import { Card, Note } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import TableStopPropagationEvent from "./TableStopEvent";
import DeleteNoteButton from "./DeleteNoteButton";
import { fsrs } from "ts-fsrs";
import DateItem from "@/lib/formatDate";

export default async function NoteTableBody({pageIndex,take,notes}:{pageIndex:number,take:number,notes:Array<Note & { card: Card }>}){
    const f = fsrs();
    const now = new Date();
    return notes.map((note: Note & { card: Card }, i: number) => (
        <Link
          legacyBehavior
          href={note.deleted ? `/note/${note.nid}?deleted=1` : `/note/${note.nid}`}
          key={note.nid}
        >
          <tr
            className={clsx(
              "hover",
              "cursor-pointer",
              note.card.suspended ? "bg-yellow-300" : ""
            )}
          >
            <th className="hidden sm:table-cell">
              {(pageIndex - 1) * take + i + 1}
            </th>
            <td>{note.question}</td>
            <td className="hidden sm:table-cell">{note.answer}</td>
            <td
              className="hidden sm:table-cell"
              title={`${note.source}${note.sourceId ?? ""}`}
            >
              {note.source}
            </td>
            <td className="hidden sm:table-cell">
              {note.card.difficulty.toFixed(2)}
            </td>
            <td className="hidden sm:table-cell">
              {note.card.stability.toFixed(2)}
            </td>
            <td className="hidden sm:table-cell">
              {f.get_retrievability(note.card, now) ?? "/"}
            </td>
            <td>
              <DateItem date={note.card.due}></DateItem>
            </td>
            <td>{note.card.state}</td>
            <td className="hidden sm:table-cell">{note.card.reps}</td>
            <TableStopPropagationEvent>
              <DeleteNoteButton
                nid={note.nid}
                cid={note.card.cid}
                deleted={note.deleted}
                className="btn-xs" />
            </TableStopPropagationEvent>
          </tr>
        </Link>
      ))
}