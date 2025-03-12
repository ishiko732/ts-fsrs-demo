'use client'

import React, { useCallback, useEffect } from 'react'
import { type Grade, Grades, Rating, show_diff_message } from 'ts-fsrs'

import { useCardContext } from '@/context/CardContext'
import { cn } from '@/lib/utils'

import { Button } from '../ui/button'

function ShowAnswerButton() {
  const { open, currentType, setOpen, schedule, noteBox, handleSchdule, handleRollBack } = useCardContext()

  const handleKeyPress = useCallback(
    async (event: React.KeyboardEvent<HTMLElement>) => {
      // Call updateCalc here
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
    [open],
  )
  useEffect(() => {
    // attach the event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyPress(event as unknown as React.KeyboardEvent<HTMLElement>)
    }
    document.addEventListener('keydown', handleKeyDown)

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyPress])

  const note = noteBox[currentType][0]
  if (!note) return null
  const color = ['bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500']
  const hoverColor = ['hover:bg-red-600', 'hover:bg-orange-600', 'hover:bg-blue-600', 'hover:bg-green-600']
  return !open ? (
    <Button
      className="mt-4 tooltip tooltip-bottom w-full md:w-[80%]"
      onClick={() => {
        setOpen(true)
      }}
      variant={'outline'}
      title="Press Space to show answer"
    >
      Show Answer
    </Button>
  ) : (
    schedule && (
      <div className="flex justify-center pt-6">
        {Grades.map((grade: Grade) => show_diff_message(schedule[grade].card.due, schedule[grade].card.last_review as Date, true)).map(
          (time: string, index: number) => (
            <Button
              key={Rating[(index + 1) as Grade]}
              className={cn('btn mx-2 btn-sm md:btn-md tooltip tooltip-bottom bg-orange-500', color[index], hoverColor[index])}
              onClick={async (e) => handleSchdule((index + 1) as Grade)}
              title={time}
            >
              <span>{Rating[(index + 1) as Grade]}</span>
              <span className="hidden sm:inline">
                <kbd
                  className={`ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100`}
                >
                  <span className="text-xs">{index + 1}</span>
                </kbd>
              </span>
            </Button>
          ),
        )}
      </div>
    )
  )
}

export default ShowAnswerButton
