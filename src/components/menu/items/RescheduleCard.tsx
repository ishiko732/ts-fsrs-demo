import { getSessionUserId } from "@/app/(auth)/api/auth/[...nextauth]/session";
import MenuItem from ".";
import RescheduledSubmitButton from "../submit/RescheduledSubmit";
import { _findCardsByUid, _reschedule } from "@/lib/reschedule";
import { getFSRSParamsByUid } from "@/lib/fsrs";
import { FSRSParameters } from "ts-fsrs";
import { Card } from "@prisma/client";

async function rescheduledCardAction(
  uid: number,
  params: FSRSParameters,
  page: number = 1,
  pageSize: number = 300
) {
  "use server";
  const cards: Card[] = await _findCardsByUid({ uid, page, pageSize });
  return await _reschedule(params, cards);
}

async function RescheduledCard() {
  const uid = await getSessionUserId();
  if (!uid) {
    return null;
  }
  const params = await getFSRSParamsByUid(uid);
  const rescheduleAction = rescheduledCardAction.bind(null, uid, params.params);
  return (
    <MenuItem tip="Reschedule">
      <RescheduledSubmitButton action={rescheduleAction} />
    </MenuItem>
  );
}

export default RescheduledCard;
