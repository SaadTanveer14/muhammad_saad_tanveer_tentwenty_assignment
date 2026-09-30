import type { SeatPrices } from '../../seating/domain/types';

export interface Showtime {
  id: string;
  movieId: number;
  /** 'YYYY-MM-DD' */
  date: string;
  /** 'HH:mm' */
  startTime: string;
  cinema: string;
  hall: string;
  prices: SeatPrices;
  /** Loyalty points alternative to the cheapest ticket. */
  bonusFrom: number;
  /** Seat layout to load for this showtime. */
  layoutId: string;
}
