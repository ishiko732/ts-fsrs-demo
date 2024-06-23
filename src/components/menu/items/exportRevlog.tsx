import { exportLogsByUid } from '@/lib/log';
import MenuItem from '.';
import ExportSubmitButton, { ExportType } from '../submit/ExportSubmit';
import { getAuthSession } from '@/app/(auth)/api/auth/[...nextauth]/session';

async function exportRevlogAction() {
  'use server';
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error('No user');
  }
  const uid = Number(session.user.id);
  const logs = await exportLogsByUid(uid);

  return {
    timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: new Date().getTimezoneOffset(),
    revlogs: logs,
  } as ExportType;
}

export default async function ExportRevlog() {
  return (
    <MenuItem tip='Export Revlog to CSV'>
      <ExportSubmitButton action={exportRevlogAction} />
    </MenuItem>
  );
}
