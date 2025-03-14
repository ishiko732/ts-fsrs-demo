import type { CardServiceType } from '@server/services/decks/cards'
import { startTransition, useRef, useState } from 'react'
import { fixState, State } from 'ts-fsrs'

import debounce from '@/lib/debounce'
import { type StateBox } from '@/vendor/fsrsToPrisma/handler'

import { type CardBoxes } from './useCardBoxes'

type RollBackProps = CardBoxes & {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export type Rollback = {
  rollBackRef: React.MutableRefObject<{ cid: number; nextStateBox: StateBox }[]>
  rollbackAble: boolean
  setRollbackAble: React.Dispatch<React.SetStateAction<boolean>>
  handleRollBack: () => Promise<Awaited<ReturnType<CardServiceType['getDetail']>>['card'] | undefined>
}

export function useRollback({ currentType, setCurrentType, noteBox, setNoteBox, open, setOpen }: RollBackProps) {
  const rollBackRef = useRef<{ cid: number; nextStateBox: StateBox }[]>([])
  const [rollbackAble, setRollbackAble] = useState(false)

  const _handleRollBack = async function () {
    if (rollBackRef.current.length === 0) {
      return undefined
    }
    const { cid, nextStateBox } = rollBackRef.current.pop()!
    const rollbackNote = (await fetch(`/api/fsrs?cid=${cid}&rollback=1`, {
      method: 'PUT',
    })
      .then((res) => res.json())
      .then((res) => res.next)) as Awaited<ReturnType<CardServiceType['getDetail']>>['card']
    startTransition(() => {
      let state = fixState(rollbackNote.state) // prisma State -> FSRS State
      if (state === State.Relearning) {
        state = State.Learning
      }
      // state = rollback state
      if (nextStateBox !== State.Review) {
        const updatNoteBox = noteBox[nextStateBox].filter((note) => note.cid !== cid) // filter out the rollback note
        console.log(`Rollback Box:${State[nextStateBox]} to ${State[state]}`)
        if (nextStateBox === state) {
          // learning === learning or relearning === relearning
          setNoteBox[state]([rollbackNote, ...updatNoteBox])
        } else {
          setNoteBox[nextStateBox]([...updatNoteBox])
          if (state === State.Review || state === State.New) {
            setNoteBox[state]((pre) => [rollbackNote, ...pre])
          }
        }
      } else {
        setNoteBox[state]((pre) => [rollbackNote, ...pre])
      }
      setCurrentType(state)
    })
    if (rollBackRef.current.length === 0) {
      setRollbackAble(false)
    }
    if (open) {
      setOpen(false)
    }
    return rollbackNote
  }
  const handleRollBack = debounce(_handleRollBack)
  const value: Rollback = {
    rollbackAble,
    setRollbackAble,
    handleRollBack,
    rollBackRef,
  }
  return value
}
