import type { SeatLayout } from './types';

export interface SeatingRepository {
  getSeatLayout(layoutId: string, signal?: AbortSignal): Promise<SeatLayout>;
}
