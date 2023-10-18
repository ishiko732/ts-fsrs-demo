import { Card, Note } from "@prisma/client";
import ScheduleCard from "./ScheduleCard";
import { useState } from "react";

type Props = {
  note: Note & {
    card: Card;
  };
};

export default function QACard({ note }: Props) {
    const [open,setOpen]=useState(false)
    return <>
        <div>question:{note.question}</div>
        <div>answer:{note.answer}</div>
        <div>state:{note.card.state}</div>
        <button onClick={(e)=>{setOpen(pre=>!pre)}}>toggle</button>
        <ScheduleCard nid={note.nid} open={open}/>
    
    </>


}
