'use client';
import type { TAppMenuAction } from '../types';
import { toastEmitter } from '@hooks/useToastListeners';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { exportLogsAction } from '@actions/useExportService';
import { getUserTimeZone } from '@actions/userTimezone';

const min_note_size = 50;
export function ExportRevlog({ deck, className, note_size }: TAppMenuAction) {
  if (note_size < min_note_size) {
    return null;
  }

  const handler = async () => {
    toastEmitter.emitToast({
      title: 'Global Service - Export Revlog',
      description: 'Start Export Revlog',
    });
    try {
      const logs = await exportLogsAction(deck.did);
      const timezone = await getUserTimeZone();
      if (logs.length === 0) {
        toastEmitter.emitToast({
          title: 'Global Service - Export Revlog',
          description: `No logs found`,
          variant: 'destructive',
        });
        return;
      }
      const GMT = timezone.hourOffset;
      const head = Object.keys(logs[0]).join(',') + '\n';
      const body = logs.map((log) => Object.values(log).join(',')).join('\n');

      const url = getDownloadUrl(head + body);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revlog_${timezone.timezone}_GMT${GMT}.csv`;
      a.click();
      toastEmitter.emitToast({
        title: 'Global Service - Export Revlog',
        description: `Export Revlog done`,
      });
    } catch (e) {
      console.error(e);
      toastEmitter.emitToast({
        title: 'Global Service - Export Revlog',
        description: `Export Revlog failed : ${e}`,
        variant: 'destructive',
      });
    }
  };

  return deck.did ? (
    <DropdownMenuItem onClick={handler} className={className}>
      <div>Export Revlog</div>
    </DropdownMenuItem>
  ) : null;
}

function getDownloadUrl(data: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  return url;
}
