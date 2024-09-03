import React from 'react';
import ForgetSubmit from '../LoadingSubmitButton';
import { forgetAction as _forgetAction } from '@/actions/userCardService';
import { cn } from '@/lib/utils';

type Props = {
  did: number;
  cid: number;
  className?: string;
};

export default function Forget({ did, cid, className }: Props) {
  const forgetAction = _forgetAction.bind(
    null,
    did,
    cid,
    new Date().getTime(),
    true
  );

  return (
    <form action={forgetAction} className='flex justify-center'>
      <ForgetSubmit className={cn('btn btn-outline', className)}>
        Forget
      </ForgetSubmit>
    </form>
  );
}
