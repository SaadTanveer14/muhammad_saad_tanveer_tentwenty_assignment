import { mockDelay } from '../../../mocks/delay';
import { createSeatLayout, standardHall } from '../domain/createSeatLayout';
import type { SeatingRepository } from '../domain/SeatingRepository';

/** Seat maps are UI-only for now: generated per showtime, stable per id. */
export const seatingRepository: SeatingRepository = {
  async getSeatLayout(layoutId, signal) {
    await mockDelay(signal);
    return createSeatLayout(standardHall(layoutId, layoutId));
  },
};

export const seatingKeys = {
  layout: (layoutId: string) => ['seating', 'layout', layoutId] as const,
};
