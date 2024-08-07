import { addLogAction, getLogsAction } from '@actions/userLogsService';
import { Revlog } from '@prisma/client';

// allow server/client use this class
export class RevlogCrud {
  async getList(cid: number): Promise<Revlog[]> {
    return await getLogsAction(cid);
  }

  async create(cid: number, log: Omit<Revlog, 'cid' | 'deleted'>) {
    return await addLogAction(cid, log);
  }
}
