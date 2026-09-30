import { MAX_SELECTION, type Seat, type SeatPrices } from './types';

export interface SeatSelectionState {
  /** Selected seats, in the order they were picked. */
  selected: Seat[];
  /** Why the last tap was ignored, for an inline hint. */
  rejection: 'taken' | 'limit' | null;
}

export type SeatSelectionAction =
  | { type: 'toggle'; seat: Seat }
  | { type: 'remove'; seatId: string }
  | { type: 'clear' };

export const initialSeatSelection: SeatSelectionState = {
  selected: [],
  rejection: null,
};

export function seatSelectionReducer(
  state: SeatSelectionState,
  action: SeatSelectionAction,
  maxSelection: number = MAX_SELECTION,
): SeatSelectionState {
  switch (action.type) {
    case 'toggle': {
      const { seat } = action;
      if (seat.status === 'taken') {
        return { ...state, rejection: 'taken' };
      }
      if (state.selected.some(s => s.id === seat.id)) {
        return {
          selected: state.selected.filter(s => s.id !== seat.id),
          rejection: null,
        };
      }
      if (state.selected.length >= maxSelection) {
        return { ...state, rejection: 'limit' };
      }
      return { selected: [...state.selected, seat], rejection: null };
    }
    case 'remove':
      return {
        selected: state.selected.filter(s => s.id !== action.seatId),
        rejection: null,
      };
    case 'clear':
      return initialSeatSelection;
  }
}

export function totalPrice(seats: Seat[], prices: SeatPrices): number {
  return seats.reduce((sum, seat) => sum + prices[seat.type], 0);
}
