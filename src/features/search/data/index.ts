import { apiConfig } from '../../../core/api';
import type { SearchRepository } from '../domain/SearchRepository';
import { mockSearchRepository } from './mockSearchRepository';
import { tmdbSearchRepository } from './tmdbSearchRepository';

export const searchRepository: SearchRepository = apiConfig.useMockData
  ? mockSearchRepository
  : tmdbSearchRepository;

export { normaliseTerm, searchKeys } from './queryKeys';
