import { appConfig } from '../../../core/config';
import type { SearchRepository } from '../domain/SearchRepository';
import { mockSearchRepository } from './mockSearchRepository';
import { tmdbSearchRepository } from './tmdbSearchRepository';

export const searchRepository: SearchRepository = appConfig.useMockData
  ? mockSearchRepository
  : tmdbSearchRepository;

export { normaliseTerm, searchKeys } from './queryKeys';
