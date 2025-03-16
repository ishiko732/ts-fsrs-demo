import { getAuthSession } from '@server/services/auth/session'
import deckService from '@server/services/decks'
import lingqService from '@server/services/extras/lingq'

import SyncSubmitButton from '../submit/SyncSubmit'
import MenuItem from '.'

async function syncLingqAction() {
  'use server'
  const params = await getParamsRequireLingqToken()
  if (!params?.token) {
    throw new Error('No lingq Token')
  }
  const langs = await lingqService.getLingqLanguageCode(params.token)
  return langs
}

async function SyncLingq() {
  const params = await getParamsRequireLingqToken()
  const tip = 'Sync Lingq'
  return params ? (
    <MenuItem tip={tip}>
      <SyncSubmitButton action={syncLingqAction} tip={tip} />
    </MenuItem>
  ) : null
}

export default SyncLingq

async function getParamsRequireLingqToken() {
  const session = await getAuthSession()
  if (!session?.user) {
    throw new Error('No user')
  }
  const uid = Number(session.user.id)
  const deckId = await deckService.getDefaultDeck(uid)

  const params = await lingqService.getLingqInfoByDeckId(uid, deckId)
  if (!params.token) {
    return null
  }
  return params
}
