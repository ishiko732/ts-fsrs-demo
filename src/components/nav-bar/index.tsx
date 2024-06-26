import { ReactNode } from 'react';
import Logo from './logo';
import { ThemesModeToggle } from '../themes/toggle';
import Github from './Github';
import { Button } from '../ui/button';
import { getAuthSession } from '@/app/(auth)/api/auth/[...nextauth]/session';
import Link from 'next/link';
import UserProfile from './user-profile';
import Setting from './setting';
import Logout from './logout';

const NavBar = async ({ children }: { children?: ReactNode }) => {
  const session = await getAuthSession();
  const user = session?.user;
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV;
  return (
    <nav className='pt-2 container flex flex-1  max-w-screen-2xl items-center'>
      {/* Left */}
      <Logo env={env} />
      {/* Right */}
      <div className='flex flex-1 items-center justify-end space-x-2'>
        {user && <UserProfile user={user} />}
        <Github name='ishiko732/ts-fsrs-demo' />
        <ThemesModeToggle />
        {!user ? (
          <Button>
            <Link href={'/api/auth/signin'}>Sign In</Link>
          </Button>
        ) : (
          <>
            <Setting />
            <Logout />
          </>
        )}
      </div>
    </nav>
  );
};
export default NavBar;
