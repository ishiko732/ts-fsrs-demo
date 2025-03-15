import { hc } from 'hono/client'

import type { AppType } from '@/app/api/[[...route]]/route'

export const client = hc<AppType>('/api')

export default client
