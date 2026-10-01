import { ApiError, type Endpoint } from '../../core/api';
import { tmdbConfig } from './config';
import {
  movieDetailsSchema,
  movieImagesSchema,
  moviePageSchema,
  movieVideosSchema,
  type MovieDetailsDto,
  type MovieImagesDto,
  type MoviePageDto,
  type MovieVideosDto,
} from './schemas';

/**
 * The TMDb operations the app uses, with their documented parameters.
 * Callers pass only what they own (page, query, dates, movie id); fixed
 * parameters come from `tmdbConfig`.
 */

/** Dependent endpoints must never be called without a real movie id. */
function movieIdSegment(movieId: number): string {
  if (!Number.isInteger(movieId) || movieId <= 0) {
    throw new ApiError('http', `Invalid movie id: ${movieId}`);
  }
  return String(movieId);
}

export interface UpcomingParams {
  page: number;
  /** YYYY-MM-DD */
  minDate: string;
  /** YYYY-MM-DD */
  maxDate: string;
}

export const tmdbEndpoints = {
  /** Entry point: upcoming theatrical releases, most popular first. */
  upcomingMovies: ({
    page,
    minDate,
    maxDate,
  }: UpcomingParams): Endpoint<MoviePageDto> => ({
    path: '/discover/movie',
    params: {
      include_adult: tmdbConfig.includeAdult,
      include_video: tmdbConfig.includeVideo,
      language: tmdbConfig.language,
      page,
      sort_by: tmdbConfig.upcoming.sortBy,
      with_release_type: tmdbConfig.upcoming.releaseTypes,
      'release_date.gte': minDate,
      'release_date.lte': maxDate,
    },
    schema: moviePageSchema,
  }),

  /** Entry point: free-text title search. */
  searchMovies: ({
    query,
    page,
  }: {
    query: string;
    page: number;
  }): Endpoint<MoviePageDto> => ({
    path: '/search/movie',
    params: {
      query,
      include_adult: tmdbConfig.includeAdult,
      language: tmdbConfig.language,
      page,
    },
    schema: moviePageSchema,
  }),

  /** Browse-by-genre tiles: the same discover endpoint, filtered by genre. */
  moviesByGenre: ({
    genreId,
    page,
  }: {
    genreId: number;
    page: number;
  }): Endpoint<MoviePageDto> => ({
    path: '/discover/movie',
    params: {
      include_adult: tmdbConfig.includeAdult,
      include_video: tmdbConfig.includeVideo,
      language: tmdbConfig.language,
      page,
      sort_by: tmdbConfig.upcoming.sortBy,
      with_genres: genreId,
    },
    schema: moviePageSchema,
  }),

  movieDetails: (movieId: number): Endpoint<MovieDetailsDto> => ({
    path: `/movie/${movieIdSegment(movieId)}`,
    params: { language: tmdbConfig.language },
    schema: movieDetailsSchema,
  }),

  movieVideos: (movieId: number): Endpoint<MovieVideosDto> => ({
    path: `/movie/${movieIdSegment(movieId)}/videos`,
    params: { language: tmdbConfig.language },
    schema: movieVideosSchema,
  }),

  movieImages: (movieId: number): Endpoint<MovieImagesDto> => ({
    path: `/movie/${movieIdSegment(movieId)}/images`,
    schema: movieImagesSchema,
  }),
};
