'use client';
import { Button } from '../ui/button';
import { LogOutIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { signOut } from 'next-auth/react';

export default function Logout() {
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant='outline' size='icon' title='Sign Out'>
            <LogOutIcon aria-label='signOut'></LogOutIcon>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>LOGOUT</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm if you want to log out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => signOut()}>
              Confrim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
