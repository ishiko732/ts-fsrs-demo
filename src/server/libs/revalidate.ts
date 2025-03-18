'use server'

import { revalidatePath } from 'next/cache'

export default async function refetchForServer(path: string) {
  revalidatePath(path)
}
