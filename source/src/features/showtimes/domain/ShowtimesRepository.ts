import type { Showtime } from './types';

export interface ShowtimesRepository {
  /** Bookable dates ('YYYY-MM-DD') for a movie, in order. */
  getDates(movieId: number, signal?: AbortSignal): Promise<string[]>;
  getShowtimes(
    movieId: number,
    date: string,
    signal?: AbortSignal,
  ): Promise<Showtime[]>;
  getShowtime(id: string, signal?: AbortSignal): Promise<Showtime>;
}
