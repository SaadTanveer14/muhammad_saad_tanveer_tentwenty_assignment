import { ApiError } from '../../../core/api';
import { addDays, toIsoDate } from '../../../core/format';
import { mockMovies } from '../../../mocks/catalog';
import { mockDelay } from '../../../mocks/delay';
import type { ShowtimesRepository } from '../domain/ShowtimesRepository';
import type { Showtime } from '../domain/types';

const DAYS_ON_SALE = 10;

const SLOTS = [
  { startTime: '12:30', hall: 'Hall 1', regular: 50, bonus: 2500 },
  { startTime: '13:30', hall: 'Hall 2', regular: 75, bonus: 3000 },
  { startTime: '16:00', hall: 'Hall 1', regular: 50, bonus: 2500 },
  { startTime: '19:15', hall: 'Hall 3', regular: 60, bonus: 2800 },
  { startTime: '21:45', hall: 'Hall 2', regular: 75, bonus: 3000 },
];

function firstShowDate(movieId: number): string {
  const today = toIsoDate(new Date());
  const release = mockMovies.find(m => m.detail.id === movieId)?.detail
    .releaseDate;
  return release && release > today ? release : today;
}

function buildShowtimes(movieId: number, date: string): Showtime[] {
  // Vary the number of screenings by weekday so dates look different.
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const count = weekday === 0 || weekday === 6 ? 5 : 3;
  return SLOTS.slice(0, count).map(slot => {
    const id = `${movieId}_${date}_${slot.startTime}`;
    return {
      id,
      movieId,
      date,
      startTime: slot.startTime,
      cinema: 'Cinetech',
      hall: slot.hall,
      prices: { regular: slot.regular, vip: slot.regular * 3 },
      bonusFrom: slot.bonus,
      layoutId: id,
    };
  });
}

export const mockShowtimesRepository: ShowtimesRepository = {
  async getDates(movieId, signal) {
    await mockDelay(signal);
    const first = firstShowDate(movieId);
    return Array.from({ length: DAYS_ON_SALE }, (_, i) => addDays(first, i));
  },
  async getShowtimes(movieId, date, signal) {
    await mockDelay(signal);
    return buildShowtimes(movieId, date);
  },
  async getShowtime(id, signal) {
    await mockDelay(signal);
    const [movieId, date] = id.split('_');
    const showtime = buildShowtimes(Number(movieId), date).find(
      s => s.id === id,
    );
    if (!showtime) {
      throw new ApiError('http', `Showtime ${id} not found`, { status: 404 });
    }
    return showtime;
  },
};
