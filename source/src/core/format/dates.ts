/**
 * Date formatting for 'YYYY-MM-DD' strings. Parsed as calendar dates (no
 * timezone shift) and formatted by hand so output is identical on Hermes,
 * JSC and Node.
 */
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parts(isoDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = isoDate.split('-').map(Number);
  return { year, month, day };
}

/** "December 22, 2021" */
export function formatLongDate(isoDate: string): string {
  const { year, month, day } = parts(isoDate);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

/** "5 Mar" */
export function formatShortDate(isoDate: string): string {
  const { month, day } = parts(isoDate);
  return `${day} ${MONTHS[month - 1].slice(0, 3)}`;
}

/** Local calendar date as 'YYYY-MM-DD'. */
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

/** `isoDate` plus `days` calendar days. */
export function addDays(isoDate: string, days: number): string {
  const { year, month, day } = parts(isoDate);
  return toIsoDate(new Date(year, month - 1, day + days));
}
