import { appConfig } from '../../../core/config';

const { language } = appConfig;

/** Cache keys include every input that changes the response. */
export const movieKeys = {
  all: ['movies'] as const,
  upcoming: (range: { minDate: string; maxDate: string }) =>
    [
      ...movieKeys.all,
      'upcoming',
      language,
      range.minDate,
      range.maxDate,
    ] as const,
  detail: (id: number) => [...movieKeys.all, 'detail', id, language] as const,
  videos: (id: number) => [...movieKeys.all, 'videos', id, language] as const,
  genres: () => [...movieKeys.all, 'genres', language] as const,
};
