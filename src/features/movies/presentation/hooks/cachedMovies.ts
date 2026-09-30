import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type { Movie, Page } from '../../domain/types';

type CachedPages = Page<Movie> | InfiniteData<Page<Movie>>;

/**
 * Every movie already in the query cache (list pages and search results).
 * Used for instant detail placeholders and offline search.
 */
export function cachedMovies(queryClient: QueryClient): Movie[] {
  const byId = new Map<number, Movie>();
  const queries = [
    ...queryClient.getQueriesData<CachedPages>({
      queryKey: ['movies', 'upcoming'],
    }),
    ...queryClient.getQueriesData<CachedPages>({ queryKey: ['search'] }),
  ];
  for (const [, data] of queries) {
    if (!data || !('pages' in data || 'results' in data)) {
      continue;
    }
    const pages = 'pages' in data ? data.pages : [data];
    for (const page of pages) {
      for (const movie of page?.results ?? []) {
        byId.set(movie.id, movie);
      }
    }
  }
  return [...byId.values()];
}
