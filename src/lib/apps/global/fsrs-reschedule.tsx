'use client';
import type { TAppMenuAction } from '../types';
import { toastEmitter } from '@hooks/useToastListeners';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { rescheduleAction } from '@actions/userCardService';

const min_note_size = 50;
export function FSRSReschedule({ deck, className, note_size }: TAppMenuAction) {
  if (note_size < min_note_size) {
    return null;
  }

  const handler = async () => {
    toastEmitter.emitToast({
      title: 'FSRS Service - Reschedule',
      description: 'Start Reschedule Cards',
    });
    try {
      await rescheduleAction(deck.did);
      toastEmitter.emitToast({
        title: 'FSRS Service - Reschedule',
        description: `Reschedule Cards done`,
      });
    } catch (e) {
      console.error(e);
      toastEmitter.emitToast({
        title: 'FSRS Service - Reschedule',
        description: `Reschedule Cards failed : ${e}`,
        variant: 'destructive',
      });
    }
  };

  return deck.did ? (
    <DropdownMenuItem onClick={handler} className={className}>
      <div>[FSRS]Reschedule</div>
    </DropdownMenuItem>
  ) : null;
}
