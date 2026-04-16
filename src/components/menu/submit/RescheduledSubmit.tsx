'use client'
import client from '@server/libs/rpc'
import { CalendarClock } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import LoadingMenu from '../loading-menu'

export default function RescheduledSubmitButton({ tip }: { tip: string }) {
  const [loading, setLoading] = useState(false)
  const pageSize = 50
  const success_cids: number[] = []
  // vercel serverless function has a 10s timeout
  const handleRescheduleHandler = async () => {
    setLoading(true)
    console.time('reschedule')
    const { data: card_ids, pagination } = await client.cards
      .$get({
        query: {
          page: String(1),
          pageSize: String(pageSize),
        },
      })
      .then((res) => res.json())
    const res = await client.scheduler.review.$put({
      json: {
        cids: card_ids,
      },
    })
    if (res.ok) {
      success_cids.push(...(await res.json()).reschedule)
    }
    const totalPage = Math.ceil(pagination.total / pagination.pageSize)
    for (let page = 2; page <= totalPage; page++) {
      const { data: card_ids } = await client.cards
        .$get({
          query: {
            page: String(page),
            pageSize: String(pageSize),
          },
        })
        .then((res) => res.json())
      const res = await client.scheduler.review.$put({
        json: {
          cids: card_ids,
        },
      })
      if (res.ok) {
        success_cids.push(...(await res.json()).reschedule)
      }
    }
    setLoading(false)
    console.timeEnd('reschedule')
    setTimeout(() => {
      window.location.reload()
    }, 5000)
  }
  return (
    <Button
      disabled={loading}
      type="submit"
      className="w-full"
      variant={'outline'}
      onClick={handleRescheduleHandler}
      aria-label={tip}
    >
      {loading ? <LoadingMenu /> : <CalendarClock aria-hidden="true" />}
    </Button>
  )
}
