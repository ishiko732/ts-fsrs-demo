import client from '@server/libs/rpc'
import type { TReviewCardDetail } from '@server/services/scheduler/review'
import { startTransition, useRef, useState } from 'react'
import { State } from 'ts-fsrs'

import debounce from '@/lib/debounce'
import { type StateBox } from '@/vendor/fsrsToPrisma/handler'

import { type CardBoxes } from './useCardBoxes'

type RollBackProps = CardBoxes & {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export type Rollback = {
  rollBackRef: React.MutableRefObject<{ cid: number; nextStateBox: StateBox; lid: number }[]>
  rollbackAble: boolean
  setRollbackAble: React.Dispatch<React.SetStateAction<boolean>>
  handleRollBack: () => Promise<TReviewCardDetail | undefined>
}

export function useRollback({ currentType, setCurrentType, noteBox, setNoteBox, open, setOpen }: RollBackProps) {
  const rollBackRef = useRef<{ cid: number; nextStateBox: StateBox; lid: number }[]>([])
  const [rollbackAble, setRollbackAble] = useState(false)

  const _handleRollBack = async function () {
    if (rollBackRef.current.length === 0) {
      return undefined
    }
    const { cid, nextStateBox, lid } = rollBackRef.current.pop()!

    const res = await client.scheduler.review.$delete({
      json: {
        cid,
        lid,
      },
    })
    if (!res.ok) {
      // @todo
    }
    const data = await res.json()
    const cardDetail = await (await client.scheduler.review[':cid'].$get({ param: { cid: String(cid) } })).json()

    startTransition(() => {
      let { next_state: state } = data
      if (state === State.Relearning) {
        state = State.Learning
      }
      // state = rollback state
      if (nextStateBox !== State.Review) {
        const updatNoteBox = noteBox[nextStateBox].filter((note) => note.cid !== cid) // filter out the rollback note
        console.log(`Rollback Box:${State[nextStateBox]} to ${State[state]}`)
        if (nextStateBox === state) {
          // learning === learning or relearning === relearning
          setNoteBox[state]([cardDetail, ...updatNoteBox])
        } else {
          setNoteBox[nextStateBox]([...updatNoteBox])
          if (state === State.Review || state === State.New) {
            setNoteBox[state]((pre) => [cardDetail, ...pre])
          }
        }
      } else {
        setNoteBox[state]((pre) => [cardDetail, ...pre])
      }
      setCurrentType(state)
    })
    if (rollBackRef.current.length === 0) {
      setRollbackAble(false)
    }
    if (open) {
      setOpen(false)
    }
    return cardDetail
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
