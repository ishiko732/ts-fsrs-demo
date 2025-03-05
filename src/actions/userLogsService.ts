'use server'

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session'
import { exportLogsByUid } from '@/lib/log'

export async function exportLogs() {
  const uid = await getSessionUserId()
  if (!uid) {
    return []
  }
  return exportLogsByUid(uid)
}
