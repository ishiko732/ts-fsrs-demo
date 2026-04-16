import { getAuthSession } from '@server/services/auth/session'
import Link from 'next/link'

import { ThemesModeToggle } from '../themes/toggle'
import { Button } from '../ui/button'
import Github from './Github'
import Logo from './logo'
import Logout from './logout'
import Setting from './setting'
import UserProfile from './user-profile'

const NavBar = async () => {
  const session = await getAuthSession()
  const user = session?.user
  return (
    <nav className="pt-2 container flex flex-1  max-w-(--breakpoint-2xl) items-center">
      {/* Left */}
      <Logo />
      {/* Right */}
      <div className="flex flex-1 items-center justify-end space-x-2">
        {user && <UserProfile user={user} />}
        <Github name="ishiko732/ts-fsrs-demo" />
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
  )
}
export default NavBar
