import { addDays, toIsoDate } from '../../../core/format';

/** Today through `windowDays` ahead, as the upcoming list's release window. */
export function upcomingDateRange(
  windowDays: number,
  today: Date = new Date(),
): { minDate: string; maxDate: string } {
  const minDate = toIsoDate(today);
  return { minDate, maxDate: addDays(minDate, windowDays) };
}
