import { TAppData, TAppProps } from '../types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/loadingSpinner';
import { cn } from '@lib/utils';
import { LingqService } from '.';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TAppPrams extends Object {
  token: string;
  language: string;
}

const InstallLingq = ({
  install,
  params,
  installHandler,
  removeHandler,
}: TAppProps<TAppPrams>) => {
  const [loading, setLoading] = useState(false);
  const [lingqToken, setLingqToken] = useState(params?.token ?? '');
  const [language, setLanguage] = useState(params?.language ?? '');
  const [languages, setLanguages] = useState<string[]>([]);
  const [message, setmessage] = useState('');
  const handlerClick = async (lang: string = language) => {
    if (!lingqToken) {
      setmessage('Please enter a valid LingQ API Key');
      return;
    } else {
      setmessage('');
    }
    setLoading(true);
    await installHandler({ token: lingqToken, language: lang });
    setLoading(false);
  };
  useEffect(() => {
    if (install && lingqToken) {
      new Promise(async () => {
        const lingqSvc = new LingqService();
        const data = await lingqSvc.getLingqLanguageCode(lingqToken);
        setLanguages(data.results.map((item) => item.language.code));
      });
    }
  }, [install, lingqToken]);
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
      {install ? (
        <>
          <Label htmlFor='language'>Language</Label>
          <Select
            value={language}
            onValueChange={async (value) => {
              console.log('onValueChange', value);
              await handlerClick(value);
              setLanguage(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a language' />
            </SelectTrigger>
            <SelectContent>
              {languages.length === 0 ? (
                <LoadingSpinner />
              ) : (
                <SelectGroup>
                  <SelectLabel>Language</SelectLabel>
                  {languages.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </>
      ) : null}
      <Button onClick={() => handlerClick()} disabled={loading}>
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
