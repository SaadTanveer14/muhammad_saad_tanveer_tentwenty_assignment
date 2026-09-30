import Config from 'react-native-config';

import { appConfig } from '../../core/config';

/**
 * Every TMDb constant in one place. The access token comes from `.env`
 * (`TMDB_READ_TOKEN`) and is never logged or hardcoded.
 */
export const tmdbConfig = {
  apiBaseUrl: Config.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3',
  imageBaseUrl: Config.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/',
  accessToken: Config.TMDB_READ_TOKEN ?? '',
  language: appConfig.language,
  includeAdult: false,
  includeVideo: false,
  upcoming: {
    sortBy: 'popularity.desc',
    /** Theatrical (limited + wide) releases. */
    releaseTypes: '2|3',
  },
  /** Image sizes the app requests, per use. */
  imageSizes: {
    poster: 'w500',
    backdrop: 'w780',
  },
} as const;

export type TmdbImageSize =
  | 'w92'
  | 'w185'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'w1280'
  | 'original';
