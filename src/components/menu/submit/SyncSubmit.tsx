'use client'
import client from '@server/libs/rpc'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import LoadingMenu from '../loading-menu'

type SyncButtonProps = {
  tip: string
  did: number
}

export default function SyncSubmitButton({ tip, did }: SyncButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSyncHandler = async () => {
    let page = 0
    let data = null
    setLoading(true)
    do {
      page++
      const result = await client.extras.lingq.sync.$post({
        json: {
          did: did,
          page: page,
          page_size: 25,
        },
      })

      if (!result.ok) {
        toast.error('Sync LingQ failed')
        setLoading(false)
        break
      }
      data = await result.json()
      toast.success(`Sync LingQ Page:${page} success`)
    } while (data?.next_page)
    setLoading(false)
    window.location.reload()
  }

  return (
    <Button
      disabled={loading}
      type="submit"
      className="w-full"
      variant={'outline'}
      onClick={handleSyncHandler}
      aria-label={tip}
    >
      {loading ? <LoadingMenu /> : <RefreshCw aria-hidden="true" />}
    </Button>
  )
}
