import { noteCrud } from '@lib/container';
import { INoteService, NoteMemoryState } from '@lib/reviews/type';
import { Note as PrimiseNote } from '@prisma/client';
import EventEmitter from 'events';

export class NoteService extends EventEmitter implements INoteService {
  private notes: Map<number, PrimiseNote> = new Map();
  private traces: PrimiseNote[] = [];
  // noteId-cardId-orderId
  private note_card_relation: Set<string> = new Set();
  constructor() {
    super();
  }

  async getNote(nid: number): Promise<PrimiseNote> {
    let note = this.notes.get(nid);
    if (!note) {
      note = await noteCrud.get(nid);
      this.notes.set(nid, note);
    }
    return note;
  }
  async edit(
    nid: number,
    note: Partial<Omit<PrimiseNote, 'did' | 'uid' | 'deleted'>>
  ): Promise<PrimiseNote> {
    const old = await this.getNote(nid);
    const updated = await noteCrud.update(old.did, old.nid, note);
    this.notes.set(nid, updated);
    this.traces.push(old);
    this.emit('edit', updated);
    return updated;
  }
  async undo(): Promise<boolean> {
    // get last trace
    const last = this.traces.pop();
    if (!last) {
      return false;
    }
    // restore note
    const updated = await noteCrud.update(last.did, last.nid, last);
    this.notes.set(last.nid, updated);
    return true;
  }

  async hydrate(notes: PrimiseNote[]): Promise<void> {
    for (const note of notes) {
      this.notes.set(note.nid, note);
      // console.debug('hydrate note', note.nid);
    }
  }

  async importMemory(context: NoteMemoryState[]): Promise<void> {
    for (const memory of context) {
      const key = `${memory.noteId}-${memory.cardId}-${memory.orderId}`;
      this.note_card_relation.add(key);
    }
  }

  _review = () => {
    // get note by random
    if (!this.note_card_relation.size) {
      return {
        data: {
          nid: 0,
          cid: 0,
          orderId: 0,
        },
        update: () => true,
      };
    }
    const index = Math.floor(Math.random() * this.note_card_relation.size);
    const rel = Array.from(this.note_card_relation)[index];
    console.log(rel);
    const [nid, cid, orderId] = rel.split('-').map(Number);
    const update = (cid: number) => {
      const key = `${nid}-${cid}-${orderId}`;
      this.note_card_relation.delete(rel);
      this.note_card_relation.add(key);
      return true;
    };
    return {
      data: { nid, cid, orderId },
      update,
    };
  };

  schduler = (
    nid: number = 0,
    cid: number = 0,
    orderId: number = 0,
    remove: boolean = true
  ) => {
    const key = `${nid}-${cid}-${orderId}`;
    if (remove) {
      this.note_card_relation.delete(key);
    }
    return this._review();
  };

  rollback = (nid: number, cid: number, orderId: number) => {
    const rel = `${nid}-${cid}-${orderId}`;
    if(!this.note_card_relation.has(rel)) {
      this.note_card_relation.add(rel);
    }
    return true;
  };
}
