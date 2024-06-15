'use client';
import { User } from 'next-auth';
import { Button } from '../ui/button';
import { Settings2Icon } from 'lucide-react';
import { useState, useRef, ReactNode } from 'react';
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
import { DialogFooter, DialogHeader } from '../ui/dialog';

export default function Setting() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('only screen and (max-width : 768px)');

  let DrawerToggle: ReactNode;

  if (isDesktop) {
    DrawerToggle = (
      <div className='absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] '>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='sm:max-w-[425px] border   border-b-stone-900 dark:border-white p-4'>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
            </div>
            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  } else {
    DrawerToggle = (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent ref={drawerRef}>
          <DrawerHeader>
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose onClick={() => setOpen(false)}>
              <Button variant='outline'>Cancel</Button>
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
      >
        <Settings2Icon></Settings2Icon>
      </Button>
      {DrawerToggle}
    </>
  );
}
