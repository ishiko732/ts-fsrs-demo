import { getAuthSession } from '@server/services/auth/session'

import { exportLogsByUid } from '@/lib/log'

import ExportSubmitButton, { type ExportType } from '../submit/ExportSubmit'
import MenuItem from '.'

async function exportRevlogAction() {
  'use server'
  const session = await getAuthSession()
  if (!session?.user) {
    throw new Error('No user')
  }
  const uid = Number(session.user.id)
  const logs = await exportLogsByUid(uid)

  return {
    timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: new Date().getTimezoneOffset(),
    revlogs: logs,
  } as ExportType
}

export default async function ExportRevlog() {
  const tip = 'Export Revlog to CSV'
  return (
    <MenuItem tip={tip}>
      <ExportSubmitButton action={exportRevlogAction} tip={tip} />
    </MenuItem>
  )
}
