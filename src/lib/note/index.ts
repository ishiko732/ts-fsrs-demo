import { noteCrud } from '@lib/container';
import { INoteService } from '@lib/deck/type';
import { Note as PrimiseNote, Card as PrismaCard } from '@prisma/client';
import { FSRS, Grade, RecordLog } from 'ts-fsrs';

export class ReviewService implements INoteService {
  private f: FSRS;
  private notes: Map<number, PrimiseNote> = new Map();
  private cards: Map<number, PrismaCard> = new Map();
  private box: number[] = [];
  private traces: PrimiseNote[] = [];
  private preview_start: number = 0;
  constructor(f: FSRS) {
    this.f = f;
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
  async getCard(nid: number): Promise<PrismaCard> {
    throw new Error('Method not implemented.');
  }
  async preview(cid: number, now: Date): Promise<RecordLog> {
    const card = await this.getCard(cid);
    const record = this.f.repeat(card, now);
    this.preview_start = new Date().getTime();
    return record;
  }
  async schduler(cid: number, now: Date, grade: Grade): Promise<boolean> {
    const duration = Math.round(
      (new Date().getTime() - this.preview_start) / 1000
    );
    this.box.push(cid);
    throw new Error('Method not implemented.');
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
  async rollback(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
