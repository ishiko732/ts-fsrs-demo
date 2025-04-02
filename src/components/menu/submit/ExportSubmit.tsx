'use client'

import { ArrowRightFromLine as ExportIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import LoadingMenu from '../loading-menu'

export type ExportType = {
  timezone: string
  offset: number
  revlogs: ExportRevLog[]
}

export default function ExportSubmitButton({ action, tip }: { action: () => Promise<ExportType>; tip: string }) {
  const [loading, setLoading] = useState(false)
  return (
    <Button
      disabled={loading}
      type="submit"
      variant={'outline'}
      className="w-full"
      onClick={async () => {
        setLoading(true)
        const data = await action()
        const logs = data.revlogs
        if (logs.length === 0) {
          alert('No logs to export')
          setLoading(false)
          return
        }
        const GMT = -data.offset / 60
        const head = Object.keys(logs[0]).join(',') + '\n'
        const body = logs.map((log) => Object.values(log).join(',')).join('\n')

        const url = getDownloadUrl(head + body)
        const a = document.createElement('a')
        a.href = url
        a.download = `revlog_${data.timezone}_GMT${GMT}.csv`
        setLoading(false)
        a.click()
      }}
      aria-label={tip}
    >
      {loading ? <LoadingMenu /> : <ExportIcon />}
    </Button>
  )
}

function getDownloadUrl(data: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  return url
}
