import { DeckService } from "@/lib/deck";
import { getSessionUserId } from "../(auth)/api/auth/[...nextauth]/session";


export const dynamic = 'force-dynamic'

export default async function Page() {
  const uid = await getSessionUserId();
  if (!uid) {
    return null;
  }
  const deckService = new DeckService();
  const fsrs = await deckService.getAlgorithm(uid)
  const deckContext = await deckService.getTodayMemoryContext(uid, "Asia/Shanghai", 4)
  console.log(fsrs.parameters)

  return <div>
    {JSON.stringify(deckContext)}
  </div>;
}
