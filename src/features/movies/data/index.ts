import { apiConfig } from '../../../core/api';
import type { MoviesRepository } from '../domain/MoviesRepository';
import { mockMoviesRepository } from './mockMoviesRepository';
import { tmdbMoviesRepository } from './tmdbMoviesRepository';

export const moviesRepository: MoviesRepository = apiConfig.useMockData
  ? mockMoviesRepository
  : tmdbMoviesRepository;

export { movieKeys } from './queryKeys';
