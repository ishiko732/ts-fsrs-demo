'use client'

import { type User } from 'next-auth'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export default function UserProfile({ user }: { user: User }) {
  return (
    <>
      <div className="hidden font-bold sm:inline-block mt-1 line-clamp-3 ">{user.name}</div>
      <Avatar className="mr-2 divide-x-2">
        <AvatarImage src={user.image ?? '/osr.png'} alt={user?.name ?? 'username'} width={40} height={40} />
        <AvatarFallback>{(user?.name ?? 'Profile Pic').substring(0, 2)}</AvatarFallback>
      </Avatar>
    </>
  )
}
