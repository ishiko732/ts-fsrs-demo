'use client'
import client from '@server/libs/rpc'
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
    <Button disabled={loading} type="submit" className="w-full" variant={'outline'} onClick={handleRescheduleHandler} aria-label={tip}>
      {loading ? <LoadingMenu /> : <RefreshIcon />}
    </Button>
  )
}

function RefreshIcon() {
  return (
    <svg className={'w-6 h-6 fill-blank dark:fill-white'} xmlns="http://www.w3.org/2000/svg">
      <path d="M 7.1601562 3 L 8.7617188 5 L 18 5 C 18.551 5 19 5.448 19 6 L 19 15 L 16 15 L 20 20 L 24 15 L 21 15 L 21 6 C 21 4.346 19.654 3 18 3 L 7.1601562 3 z M 4 4 L 0 9 L 3 9 L 3 18 C 3 19.654 4.346 21 6 21 L 16.839844 21 L 15.238281 19 L 6 19 C 5.449 19 5 18.552 5 18 L 5 9 L 8 9 L 4 4 z"></path>
    </svg>
  )
}
