import { noteCrud } from '@lib/container';
import { INoteService } from '@lib/reviews/type';
import { Note as PrimiseNote } from '@prisma/client';
import EventEmitter from 'events';

export class NoteService extends EventEmitter implements INoteService {
  private notes: Map<number, PrimiseNote> = new Map();
  private traces: PrimiseNote[] = [];
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
    const updated = await noteCrud.update(old.nid, old.did, note);
    this.notes.set(nid, updated);
    this.traces.push(old);
    return updated;
  }
  async undo(): Promise<boolean> {
    // get last trace
    const last = this.traces.pop();
    if (!last) {
      return false;
    }
    // restore note
    const updated = await noteCrud.update(last.nid, last.did, last);
    this.notes.set(last.nid, updated);
    return true;
  }

  async hydrate(notes: PrimiseNote[]): Promise<void> {
    for (const note of notes) {
      this.notes.set(note.nid, note);
      console.debug('hydrate note', note.nid);
    }
  }

  review = () => {
    // get note by random
    if (!this.notes.size) {
      return 0;
    }
    const index = Math.floor(Math.random() * this.notes.size);
    const nid = Array.from(this.notes.keys())[index];
    return nid;
  };
}
