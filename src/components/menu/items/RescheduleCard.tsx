import { getSessionUserId } from '@services/auth/session'
import { FSRSParameters } from 'ts-fsrs'

import { getFSRSParamsByUid } from '@/lib/fsrs'
import { _findCardsByUid, _reschedule } from '@/lib/reschedule'

import RescheduledSubmitButton from '../submit/RescheduledSubmit'
import MenuItem from '.'

async function rescheduledCardAction(uid: number, params: FSRSParameters, page: number = 1, pageSize: number = 300) {
  'use server'
  const cards = await _findCardsByUid({ uid, page, pageSize })
  return _reschedule(params, cards)
}

async function RescheduledCard() {
  const uid = await getSessionUserId()
  if (!uid) {
    return null
  }
  const params = await getFSRSParamsByUid(uid)
  const rescheduleAction = rescheduledCardAction.bind(null, uid, params.params)
  const tip = 'Reschedule'
  return (
    <MenuItem tip={tip}>
      <RescheduledSubmitButton action={rescheduleAction} tip={tip} />
    </MenuItem>
  )
}

export default RescheduledCard
