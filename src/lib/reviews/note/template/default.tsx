import { Note } from '@prisma/client';
import { ITemplate } from './types';

class DefaultTemplate implements ITemplate {
  constructor() {}

  FrontTemplate = ({ note }: { note: Note }) => {
    return (
      <div className='item-center'>
        <div className='w-full'>
          <span className='flex justify-center items-center text-2xl'>
            {note.question}
          </span>
        </div>
      </div>
    );
  };

  BackTemplate = ({ open, note }: { open: boolean; note: Note }) => {
    return open ? (
      <div className='pt-4 mx-auto max-w-5xl px-4'>
        <div>{note?.answer}</div>
      </div>
    ) : null;
  };
}

const defaultTemplate: ITemplate = new DefaultTemplate();
export default defaultTemplate;
