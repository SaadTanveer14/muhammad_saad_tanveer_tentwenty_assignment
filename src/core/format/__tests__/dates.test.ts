import { addDays, formatLongDate, formatShortDate } from '../dates';

describe('date formatting', () => {
  it('formats the long form used in headers', () => {
    expect(formatLongDate('2021-12-22')).toBe('December 22, 2021');
  });

  it('formats the short form used on date chips', () => {
    expect(formatShortDate('2021-03-05')).toBe('5 Mar');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2021-12-30', 3)).toBe('2022-01-02');
  });
});
