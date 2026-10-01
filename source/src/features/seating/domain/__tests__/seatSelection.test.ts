import type { Seat } from '../types';
import {
  initialSeatSelection,
  seatSelectionReducer,
  totalPrice,
} from '../seatSelection';

const seat = (id: string, overrides: Partial<Seat> = {}): Seat => ({
  id,
  row: '3',
  number: Number(id),
  type: 'regular',
  status: 'free',
  ...overrides,
});

describe('seatSelectionReducer', () => {
  it('selects a free seat and deselects it on a second tap', () => {
    const selected = seatSelectionReducer(initialSeatSelection, {
      type: 'toggle',
      seat: seat('1'),
    });
    expect(selected.selected.map(s => s.id)).toEqual(['1']);

    const deselected = seatSelectionReducer(selected, {
      type: 'toggle',
      seat: seat('1'),
    });
    expect(deselected.selected).toEqual([]);
  });

  it('rejects taken seats', () => {
    const state = seatSelectionReducer(initialSeatSelection, {
      type: 'toggle',
      seat: seat('1', { status: 'taken' }),
    });
    expect(state.selected).toEqual([]);
    expect(state.rejection).toBe('taken');
  });

  it('enforces the maximum selection', () => {
    let state = initialSeatSelection;
    for (const id of ['1', '2', '3']) {
      state = seatSelectionReducer(
        state,
        { type: 'toggle', seat: seat(id) },
        2,
      );
    }
    expect(state.selected.map(s => s.id)).toEqual(['1', '2']);
    expect(state.rejection).toBe('limit');
  });

  it('removes a specific seat (the ✕ on its pill)', () => {
    let state = seatSelectionReducer(initialSeatSelection, {
      type: 'toggle',
      seat: seat('1'),
    });
    state = seatSelectionReducer(state, { type: 'toggle', seat: seat('2') });
    state = seatSelectionReducer(state, { type: 'remove', seatId: '1' });
    expect(state.selected.map(s => s.id)).toEqual(['2']);
  });
});

describe('totalPrice', () => {
  it('prices each seat by its type', () => {
    const seats = [seat('1'), seat('2', { type: 'vip' })];
    expect(totalPrice(seats, { regular: 50, vip: 150 })).toBe(200);
  });
});
