import { useQuery } from '@tanstack/react-query';

import { cachePolicy } from '../../../../app/cachePolicy';
import { searchKeys, searchRepository } from '../../data';

export type SearchResultsParams =
  | { query: string }
  | { genreId: number | null; genreName: string };

/** Results for a submitted search or a browse category (screen 04). */
export function useSearchResults(params: SearchResultsParams) {
  const isGenre = 'genreId' in params;
  const genreId = isGenre ? params.genreId : null;
  const term = isGenre ? '' : params.query;

  return useQuery({
    queryKey: isGenre ? searchKeys.genre(genreId ?? -1) : searchKeys.term(term),
    queryFn: async ({ signal }) => {
      if (!isGenre) {
        return searchRepository.search(term, 1, signal);
      }
      if (genreId == null) {
        return { page: 1, totalPages: 1, totalResults: 0, results: [] };
      }
      return searchRepository.getByGenre(genreId, 1, signal);
    },
    staleTime: cachePolicy.search.staleTime,
  });
}
