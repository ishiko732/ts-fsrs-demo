import NextAuth from 'next-auth'

import { options } from './options'

const AuthHandler = NextAuth(options)

export default AuthHandler
