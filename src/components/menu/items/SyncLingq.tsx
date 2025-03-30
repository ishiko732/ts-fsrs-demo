import { getSessionUserIdThrow } from '@server/services/auth/session'
import deckService from '@server/services/decks'
import lingqService from '@server/services/extras/lingq'

import SyncSubmitButton from '../submit/SyncSubmit'
import MenuItem from '.'

async function SyncLingq() {
  const params = await getParamsRequireLingqToken()
  const tip = 'Sync Lingq'
  return params ? (
    <MenuItem tip={tip}>
      <SyncSubmitButton tip={tip} did={params.deckId} />
    </MenuItem>
  ) : null
}

export default SyncLingq

async function getParamsRequireLingqToken() {
  const uid = await getSessionUserIdThrow()
  const deckId = await deckService.getDefaultDeck(uid)
  const params = await lingqService.getLingqInfoByDeckId(uid, deckId)
  if (!params.token) {
    return null
  }
  return { params, deckId }
}
