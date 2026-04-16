'use client'
import { authClient } from '@server/services/auth/client'
import { LogOutIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
} from '@/components/ui/alert-dialog'

import { Button } from '../ui/button'

export default function Logout() {
  const router = useRouter()
  const handleSignOut = async () => {
    await authClient.signOut()
    router.refresh()
    router.push('/')
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" title="Sign Out">
          <LogOutIcon aria-label="signOut"></LogOutIcon>
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
          <AlertDialogAction onClick={handleSignOut}>Confrim</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
