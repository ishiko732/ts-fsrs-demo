import { State } from 'ts-fsrs'
export type StateBox = ExcludeReLearning<State>
// StateBox:
// 0: New
// 1: Learning
// 2: Review

type ExcludeReLearning<T> = Exclude<T, State.Relearning>
