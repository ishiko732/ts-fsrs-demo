import { TAppData, TAppProps } from '../types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import LoadingSpinner from '@/components/loadingSpinner';
import { cn } from '@lib/utils';

interface TAppPrams extends Object {
  token: string;
}

const InstallLingq = ({
  install,
  params,
  installHandler,
  removeHandler,
}: TAppProps<TAppPrams>) => {
  const [loading, setLoading] = useState(false);
  const [lingqToken, setLingqToken] = useState(params?.token ?? '');
  const [message, setmessage] = useState('');
  const handlerClick = async () => {
    if (!lingqToken) {
      setmessage('Please enter a valid LingQ API Key');
      return;
    } else {
      setmessage('');
    }
    setLoading(true);
    await installHandler({ token: lingqToken });
    setLoading(false);
  };
  return (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Label
        htmlFor='lingqToken'
        className={cn(message ? 'text-red-500' : null)}
      >
        LingQ API Key
        <Badge variant='outline' className='ml-4'>
          <Link
            className='btn btn-xs'
            target='_blank'
            href={'https://www.lingq.com/accounts/apikey/'}
          >
            Get Key
          </Link>
        </Badge>
      </Label>
      <Input
        type='text'
        placeholder='LingQ API Key'
        value={lingqToken}
        onChange={(e) => setLingqToken(e.target.value)}
        aria-errormessage={message}
      />
      <p className='text-red-500 text-sm'>{message}</p>
      <Button onClick={handlerClick} disabled={loading}>
        {loading ? <LoadingSpinner /> : null}
        {!install ? 'Install' : 'Update'}
      </Button>
      {install ? (
        <Button
          variant='destructive'
          onClick={removeHandler}
          disabled={loading || !install}
        >
          {loading ? <LoadingSpinner /> : null}
          Remove
        </Button>
      ) : null}
    </div>
  );
};

const LingqAppData: TAppData = {
  name: 'Lingq Service',
  //   description: ' install Lingq Service',
  component: InstallLingq,
} as TAppData;

export default LingqAppData;
