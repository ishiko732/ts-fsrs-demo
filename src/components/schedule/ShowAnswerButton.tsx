'use client'

import type React from 'react'
import { useCallback, useEffect } from 'react'
import { type Grade, Grades, Rating, show_diff_message } from 'ts-fsrs'

import { useCardContext } from '@/context/CardContext'
import { cn } from '@/lib/utils'

import { Button } from '../ui/button'

const GRADE_STYLES = [
  // Again
  'bg-rose-600 hover:bg-rose-500 active:bg-rose-700',
  // Hard
  'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
  // Good
  'bg-sky-600 hover:bg-sky-500 active:bg-sky-700',
  // Easy
  'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700',
] as const

function ShowAnswerButton() {
  const {
    open,
    currentType,
    setOpen,
    schedule,
    noteBox,
    handleSchdule,
    handleRollBack,
  } = useCardContext()

  const handleKeyPress = useCallback(
    async (event: React.KeyboardEvent<HTMLElement>) => {
      if (!open && event.code === 'Space') {
        setOpen(true)
      } else if (open) {
        switch (event.key) {
          case '1':
          case '2':
          case '3':
          case '4':
            await handleSchdule(Number(event.key) as Grade)
            break
        }
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        await handleRollBack()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, handleRollBack, handleSchdule, setOpen]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyPress(event as unknown as React.KeyboardEvent<HTMLElement>)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyPress])

  const note = noteBox[currentType][0]
  if (!note) return null

  if (!open) {
    return (
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        className="h-12 w-full gap-3 text-base font-medium"
      >
        <span>Show answer</span>
        <kbd className="pointer-events-none inline-flex h-6 select-none items-center rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-2 font-mono text-[11px] font-medium uppercase tracking-wide">
          Space
        </kbd>
      </Button>
    )
  }

  if (!schedule) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Grades.map((grade: Grade) =>
        show_diff_message(
          schedule[grade].card.due,
          schedule[grade].card.last_review as Date,
          true
        )
      ).map((time: string, index: number) => {
        const grade = (index + 1) as Grade
        const label = Rating[grade]
        return (
          <button
            type="button"
            key={label}
            onClick={async () => handleSchdule(grade)}
            title={`${label} · ${time}`}
            className={cn(
              'group relative flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-4 text-white shadow-xs transition-[filter,transform,background-color] hover:brightness-110 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              GRADE_STYLES[index]
            )}
          >
            <span className="text-sm font-semibold tracking-wide">{label}</span>
            <span className="text-[11px] font-medium tabular-nums opacity-90">
              {time}
            </span>
            <kbd className="pointer-events-none absolute right-2 top-2 inline-flex h-5 w-5 select-none items-center justify-center rounded bg-white/20 font-mono text-[10px] font-medium text-white">
              {index + 1}
            </kbd>
          </button>
        )
      })}
    </div>
  )
}

export default ShowAnswerButton
