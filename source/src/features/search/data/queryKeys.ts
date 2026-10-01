import { appConfig } from '../../../core/config';

const { language } = appConfig;

/**
 * Search cache keys: query + page + language. Live results (one page) and
 * the paginated results screen use different keys because their cached
 * shapes differ.
 */
export const searchKeys = {
  all: ['search'] as const,
  /** `term` must already be normalised (see `normaliseTerm`). */
  livePage: (term: string) =>
    [...searchKeys.all, 'term', term, language, 1] as const,
  results: (term: string) =>
    [...searchKeys.all, 'results', term, language] as const,
  genre: (genreId: number | null) =>
    [...searchKeys.all, 'genre', genreId, language] as const,
  categories: () => [...searchKeys.all, 'categories'] as const,
};

export function normaliseTerm(input: string): string {
  return input.trim().toLowerCase();
}
