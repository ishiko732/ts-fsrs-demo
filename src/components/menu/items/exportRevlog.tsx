import { getSessionUserIdThrow } from '@server/services/auth/session'
import statisticsService from '@server/services/scheduler/statistics'

import ExportSubmitButton, { type ExportType } from '../submit/ExportSubmit'
import MenuItem from '.'

async function exportRevlogAction() {
  'use server'
  const uid = await getSessionUserIdThrow()
  const logs = await statisticsService.exportLogs(uid)

  return {
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
