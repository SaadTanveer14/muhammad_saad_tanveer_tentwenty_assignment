import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { cachePolicy } from '../../../../app/cachePolicy';
import type { Page, Movie } from '../../../movies/domain/types';
import { searchKeys, searchRepository } from '../../data';

export type SearchResultsParams =
  | { query: string }
  | { genreId: number | null; genreName: string };

const EMPTY_PAGE: Page<Movie> = {
  page: 1,
  totalPages: 1,
  totalResults: 0,
  results: [],
};

/**
 * Paginated results for a submitted search or a browse category (screen 04).
 * More pages are requested while `page < total_pages`.
 */
export function useSearchResults(params: SearchResultsParams) {
  const isGenre = 'genreId' in params;
  const genreId = isGenre ? params.genreId : null;
  const term = isGenre ? '' : params.query;

  const query = useInfiniteQuery({
    queryKey: isGenre ? searchKeys.genre(genreId) : searchKeys.results(term),
    queryFn: ({ pageParam, signal }) => {
      if (!isGenre) {
        return searchRepository.search(term, pageParam, signal);
      }
      return genreId == null
        ? Promise.resolve(EMPTY_PAGE)
        : searchRepository.getByGenre(genreId, pageParam, signal);
    },
    initialPageParam: 1,
    getNextPageParam: last =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: cachePolicy.search.staleTime,
  });

  const movies = useMemo(() => {
    const seen = new Set<number>();
    return (query.data?.pages ?? [])
      .flatMap(page => page.results)
      .filter(movie =>
        seen.has(movie.id) ? false : (seen.add(movie.id), true),
      );
  }, [query.data]);

  return {
    ...query,
    movies,
    totalResults: query.data?.pages[0]?.totalResults ?? 0,
  };
}
