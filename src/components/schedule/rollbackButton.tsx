'use client'

import { Undo2 } from 'lucide-react'

import { useCardContext } from '@/context/CardContext'

import { Button } from '../ui/button'

export default function RollbackButton() {
  const { rollbackAble, handleRollBack } = useCardContext()

  if (!rollbackAble) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await handleRollBack()
      }}
      aria-label="Undo"
      title="Press Ctrl+Z (⌘+Z) to undo"
      className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
    >
      <Undo2 className="size-4" aria-hidden="true" />
      <span className="hidden text-xs font-medium sm:inline">Undo</span>
    </Button>
  )
}
