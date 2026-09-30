import { mockShowtimesRepository } from './mockShowtimesRepository';

/** Booking is UI-only for now, so showtimes are always mocked. */
export const showtimesRepository = mockShowtimesRepository;

export const showtimeKeys = {
  all: ['showtimes'] as const,
  dates: (movieId: number) => [...showtimeKeys.all, 'dates', movieId] as const,
  list: (movieId: number, date: string) =>
    [...showtimeKeys.all, 'list', movieId, date] as const,
  detail: (id: string) => [...showtimeKeys.all, 'detail', id] as const,
};
