'use client';
import { Button } from '@/components/ui/button';
import { Settings2Icon } from 'lucide-react';
import { useState, useRef, ReactNode, useEffect, Suspense } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@react-hookz/web';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@radix-ui/react-dialog';
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/loadingSpinner';

const DeckForm = dynamic(() => import('./form'), {
  loading: LoadingSpinner,
  ssr: false,
});

export default function DeckDialog({
  fuzz,
  short_term,
  open,
  setOpen,
}: {
  fuzz: boolean;
  short_term: boolean;
  open:boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('only screen and (max-width : 768px)');
  let DrawerToggle: ReactNode;

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = () => {
    document.getElementById('deck_setting')?.click();
  };
  if (!isDesktop) {
    DrawerToggle = (
      <div className='absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[800px] z-[999] dark:bg-black bg-white'>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='sm:max-w-[625px] border  border-b-stone-900 dark:border-white p-4 max-h-[800px] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex justify-center items-center text-md'>
                Add deck
              </DialogTitle>
              <DialogDescription className='flex justify-center items-center text-sm'>
                Set your parameters.
              </DialogDescription>
            </DialogHeader>
            <Suspense>
              <DeckForm
                loading={loading}
                setLoading={setLoading}
                fuzz={fuzz}
                short_term={short_term}
              />
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
            <DeckForm
              loading={loading}
              setLoading={setLoading}
              fuzz={fuzz}
              short_term={short_term}
            />
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
  return <>{isClient && DrawerToggle}</>;
}
