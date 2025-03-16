import type { TReviewCardDetail } from '@server/services/scheduler/review'
import type { StateBox } from '@server/services/scheduler/review/types'
import { fixDate, State } from 'ts-fsrs'

export type ChangeState = {
  updateStateBox: (noteBox: { [key in StateBox]: Array<TReviewCardDetail> }, currentType: StateBox, nextDue?: Date) => StateBox
}

export function useChangeState() {
  function updateStateBox(noteBox: { [key in StateBox]: Array<TReviewCardDetail> }, currentType: StateBox, nextDue?: number) {
    let change: StateBox = State.New // default State.New
    switch (currentType) {
      case State.New:
        if (noteBox[State.Learning].length > 0) {
          change = State.Learning // new -> learning
        } else if (noteBox[State.Review].length > 0) {
          change = State.Review // new -> review
        }
        break
      case State.Learning:
        if (noteBox[State.Review].length > 0) {
          change = State.Review // learning/relearning -> review
        } else if (noteBox[State.New].length > 0) {
          change = State.New // learning/relearning -> new
        } else {
          change = State.Learning // learning/relearning -> learning/relearning
        }
        break
      case State.Review:
        if (noteBox[State.Learning].length > 0) {
          change = State.Learning // review -> learning
        } else if (noteBox[State.New].length > 0) {
          change = State.New // review -> new
        } else {
          change = State.Review // review -> review
        }
        break
    }
    change =
      change === State.Learning &&
      noteBox[State.Learning].length > 0 &&
      fixDate(noteBox[State.Learning][0].due).getTime() - new Date().getTime() > 0
        ? randomNewOrReviewState(noteBox)
        : change
    return change
  }

  function randomNewOrReviewState(noteBox: {
    [key in StateBox]: Array<TReviewCardDetail>
  }) {
    if (noteBox[State.New].length === 0) {
      return State.Review
    } else if (noteBox[State.Review].length === 0) {
      return State.New
    } else {
      return Math.random() > 0.5 ? State.Review : State.New
    }
  }

  const value = {
    updateStateBox,
  }
  return value
}
