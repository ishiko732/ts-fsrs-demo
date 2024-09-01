'use client';
import { ProgeigoNodeData } from '@/types';
// import progeigo from '@public/プログラミング必須英単語600+.json' assert { type: 'json' };
import type { TAppMenuAction } from '../types';
import { noteCrud } from '@lib/container';
import { JsonObject } from '@prisma/client/runtime/library';
import { Note } from '@prisma/client';
import { toastEmitter } from '@hooks/useToastListeners';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function InitProgeigoDates({ deck, className }: TAppMenuAction) {
  const extend = deck.extends as Record<string, object>;
  console.log(deck.name, Object.keys(extend).length);
  if (Object.keys(extend).length !== 0) {
    return null;
  }

  const handler = async () => {
    const req = await fetch('プログラミング必須英単語600+.json').then((res) =>
      res.json()
    );
    const dates = req.data.英単語.map(
      (node: any) => node.data
    ) as ProgeigoNodeData[];
    const notes = dates.map((node) => {
      return {
        question: node.英単語,
        answer: node.意味,
        source: 'ProgeigoNote',
        sourceId: `${node.$rowIndex}`,
        extend: node as unknown as JsonObject,
      } satisfies Omit<Note, 'nid' | 'deleted' | 'uid' | 'did'>;
    });
    toastEmitter.emitToast({
      title: 'Global Service - Init Progeigo',
      description: `Init Progeigo Notes: ${deck.did} dates: ${dates.length}`,
    });
    try {
      await noteCrud.creates(deck.did, notes);
      toastEmitter.emitToast({
        title: 'Global Service - Init Progeigo',
        description: `Init Progeigo Notes: ${deck.did} done`,
      });
    } catch (e) {
      console.error(e);
      toastEmitter.emitToast({
        title: 'Global Service - Init Progeigo',
        description: `Init Progeigo failed : ${e}`,
        variant: 'destructive',
      });
    }
  };

  return deck.did ? (
    <DropdownMenuItem onClick={handler} className={className}>
      <div>Init Progeigo</div>
    </DropdownMenuItem>
  ) : null;
}
