'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { useMediaQuery } from '@react-hookz/web';
import { Settings2Icon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ReactNode, Suspense,useEffect, useRef, useState } from 'react';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

import LoadingSpinner from '../loadingSpinner';
import { Button } from '../ui/button';
import { DialogClose, DialogFooter, DialogHeader } from '../ui/dialog';

const FSRSConfig = dynamic(() => import('./FSRSConfig'), {
  loading: LoadingSpinner,
  ssr: false,
});

export default function Setting() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('only screen and (max-width : 768px)');
  let DrawerToggle: ReactNode;

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = () => {
    document.getElementById('fsrsSetting')?.click();
  };
  if (!isDesktop) {
    DrawerToggle = (
      <div className='absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[800px] z-[999] dark:bg-black bg-white'>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='sm:max-w-[625px] border  border-b-stone-900 dark:border-white p-4 max-h-[800px] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex justify-center items-center text-md'>
                Edit profile
              </DialogTitle>
              <DialogDescription className='flex justify-center items-center text-sm'>
                Set your parameters.
              </DialogDescription>
            </DialogHeader>
            <Suspense>
              <FSRSConfig loading={loading} setLoading={setLoading} />
            </Suspense>
            <DialogFooter>
              <DialogClose onClick={() => setOpen(false)}>
                <Button className='w-full' variant='outline'>
                  Cancel
                </Button>
              </DialogClose>
              <Button type='submit' onClick={handleSubmit} disabled={loading}>
                {loading && <LoadingSpinner />}Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  } else {
    DrawerToggle = (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          ref={drawerRef}
          className='max-h-[80%] dark:bg-black bg-white'
        >
          <DrawerHeader>
            <DrawerTitle className='flex justify-center items-center text-md'>
              Edit profile
            </DrawerTitle>
            <DrawerDescription className='flex justify-center items-center text-sm'>
              Set your parameters.
            </DrawerDescription>
          </DrawerHeader>
          <Suspense>
            <FSRSConfig loading={loading} setLoading={setLoading} />
          </Suspense>
          <DrawerFooter>
            <Button type='submit' onClick={handleSubmit} disabled={loading}>
              {loading && <LoadingSpinner />}Save changes
            </Button>
            <DrawerClose onClick={() => setOpen(false)}>
              <Button className='w-full' variant='outline'>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <>
      <Button
        variant='outline'
        size='icon'
        onClick={() => setOpen((pre) => !pre)}
        title='Setting'
      >
        <Settings2Icon aria-label='setting'></Settings2Icon>
      </Button>
      {isClient && DrawerToggle}
    </>
  );
}
