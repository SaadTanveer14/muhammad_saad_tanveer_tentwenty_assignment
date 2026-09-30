import { appConfig } from '../../../core/config';
import type { MoviesRepository } from '../domain/MoviesRepository';
import { mockMoviesRepository } from './mockMoviesRepository';
import { tmdbMoviesRepository } from './tmdbMoviesRepository';

export const moviesRepository: MoviesRepository = appConfig.useMockData
  ? mockMoviesRepository
  : tmdbMoviesRepository;

export { movieKeys } from './queryKeys';
