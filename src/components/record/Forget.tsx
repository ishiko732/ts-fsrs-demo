import React from 'react';

import { forgetAction as _forgetAction } from '@/actions/userCardService';
import { cn } from '@/lib/utils';

import ForgetSubmit from '../LoadingSubmitButton';

type Props = {
  cid: number;
  className?: string;
};

export default function Forget({ cid, className }: Props) {
  const forgetAction = _forgetAction.bind(
    null,
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
