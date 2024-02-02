import { State } from "ts-fsrs"
import { Rating } from "ts-fsrs"
type Range0To23 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;
type RangeM12To14 = -12 | -11 | -10 | -9 | -8 | -7 | -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

// Ref:https://github.com/open-spaced-repetition/fsrs-optimizer
type RevLogSchema = {
    card_id: number, // The unique identifier of the flashcard being reviewed
    review_time: number, // The exact moment when the review took place
    review_rating: Rating, // The user's rating for the review. This rating is subjective and depends on how well the user believes they remembered the information on the card
    review_state: State, // The state of the card at the time of review. This describes the learning phase of the card
    review_duration?: number // The time spent on reviewing the card, typically in miliseconds
}

type UserOption = {
    timezone: string,
    day_start: Range0To23; // used next day start hour
    revlog_start_time: number; // the date at which before reviews will be ignored
    filter_out_suspended_cards: boolean; // filter out suspended cards
}