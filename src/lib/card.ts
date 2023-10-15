import { CardPrisma, fsrs} from "ts-fsrs";
import { getNoteByNid } from "./note";
import { fixDate } from "ts-fsrs/dist/help";


export async function schedulerCard(nid:number,now:Date){
    const note=await getNoteByNid(nid)
    if(!note){  
        throw new Error("note not found")
    }
    const f = fsrs()
    const cardByPrisma=note.card  as unknown as CardPrisma
    const card={
        ...cardByPrisma,
        due:fixDate(cardByPrisma.due),
        last_review:cardByPrisma.last_review?fixDate(cardByPrisma.last_review):undefined
    }
    return f.repeat(card,new Date())
}