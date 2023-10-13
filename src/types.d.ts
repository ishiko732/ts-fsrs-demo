import { card } from "@prisma/client"
import{createEmptyCard} from "ts-fsrs"
declare module 'ts-fsrs'{
    function createEmptyCardByPrisma():Partial<card>{
        const card  = createEmptyCard()
        return card;
    }
    
}