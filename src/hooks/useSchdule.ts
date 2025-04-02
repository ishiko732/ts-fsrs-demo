'use client'

import client from '@server/libs/rpc'
import type { TReviewCardDetail } from '@server/services/scheduler/review'
import type { ReviewServiceType } from '@server/services/scheduler/review'
import { createReviewSnapshot } from '@server/services/scheduler/review/preview'
import { startTransition, useEffect, useState } from 'react'
import { fixDate, type Grade, type RecordLog, State } from 'ts-fsrs'

import callHandler from '@/components/source/call'
import debounce from '@/lib/debounce'

import { type CardBoxes } from './useCardBoxes'
import { useChangeState } from './useChangeState'
import { type Rollback } from './useRollback'

type SchduleProps = CardBoxes &
  Rollback & {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
  }

export type DSR = {
  D: number
  S: number
  R: string
}

export type Schedule = {
  showTime: number
  setShowTime: React.Dispatch<React.SetStateAction<number>>
  DSR: DSR | undefined
  setDSR: React.Dispatch<React.SetStateAction<DSR | undefined>>
  schedule: RecordLog | undefined
  setSchedule: React.Dispatch<React.SetStateAction<RecordLog | undefined>>
  handleChange: (res: Awaited<ReturnType<ReviewServiceType['next']>>, note: TReviewCardDetail) => boolean
  handleSchdule: (grade: Grade) => Promise<boolean>
}

export function useSchedule({
  noteBox,
  currentType,
  setCurrentType,
  setNoteBox,
  rollBackRef,
  rollbackAble,
  setRollbackAble,
  setOpen,
}: SchduleProps) {
  const { updateStateBox } = useChangeState()
  const [showTime, setShowTime] = useState(new Date().getTime())
  const [DSR, setDSR] = useState<DSR>()
  const [schedule, setSchedule] = useState<RecordLog | undefined>(undefined)

  const handleChange = function (res: Awaited<ReturnType<ReviewServiceType['next']>>, note: TReviewCardDetail) {
    const { next_state, next_due, suspended, lid, cid } = res
    if (next_due) {
      note.due = +next_due
    }
    const change = updateStateBox(noteBox, currentType /**next_due**/)
    // update state and data
    let updatedNoteBox: Array<TReviewCardDetail> = [...noteBox[currentType]]
    updatedNoteBox = updatedNoteBox.slice(1)
    updatedNoteBox = updatedNoteBox.toSorted((a, b) => fixDate(a.due).getTime() - fixDate(b.due).getTime())
    startTransition(() => {
      // state update is marked as a transition, a slow re-render did not freeze the user interface.
      // if suspended, the card will not be added to the learning box
      if (next_state !== State.Review && !suspended) {
        if (currentType === State.Learning) {
          setNoteBox[currentType]([...updatedNoteBox, note!])
          console.log([...updatedNoteBox, note!])
        } else {
          if (currentType === State.New || currentType === State.Review) {
            setNoteBox[currentType](updatedNoteBox)
          }
          setNoteBox[State.Learning]((pre) => [...pre, note!])
        }
      } else {
        setNoteBox[currentType](updatedNoteBox)
      }
      rollBackRef.current.push({
        cid: cid,
        nextStateBox: next_state === State.Relearning ? State.Learning : next_state,
        lid: lid,
      })
      if (rollBackRef.current.length > 0 && rollbackAble === false) {
        setRollbackAble(true)
      }
      console.log(
        `Change ${State[currentType]} to ${State[change]}, Card next State: ${State[next_state]},current rollback length ${rollBackRef.current.length}`,
      )
      setCurrentType(change)
      callHandler({ ...note }, res)
    })
    return true
  }

  const handleSchdule = debounce(async (grade: Grade) => {
    const note = noteBox[currentType][0]
    const now = new Date()
    const duration = now.getTime() - showTime

    const res = await client.scheduler.review.$post({
      json: {
        cid: note.cid,
        rating: grade,
        timestamp: now.getTime(),
        offset: -now.getTimezoneOffset(),
        duration,
      },
    })

    if (res.ok) {
      const json = await res.json()
      console.log(`[cid:${note.cid}]duration:${duration}ms`)
      handleChange(json, note)
      setOpen(false)
    }
    return res.ok
  })
  // get schedule
  useEffect(() => {
    const note = noteBox[currentType][0]
    const now = new Date()
    if (note) {
      const params = note.fsrs
      const { preview, DSR } = createReviewSnapshot(note, params, now)
      setSchedule(preview)
      setShowTime(+now)
      setDSR(DSR)
    }
  }, [currentType, noteBox, setSchedule])

  const value: Schedule = {
    showTime,
    setShowTime,
    DSR,
    setDSR,
    schedule,
    setSchedule,
    handleChange,
    handleSchdule,
  }
  return value
}
