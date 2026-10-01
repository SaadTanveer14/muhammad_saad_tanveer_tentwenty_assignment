import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { cachePolicy } from '../../../../app/cachePolicy';
import { useDebouncedValue } from '../../../../core/hooks';
import { useIsOnline } from '../../../../core/network';
import { cachedMovies } from '../../../movies/presentation/hooks';
import { normaliseTerm, searchKeys, searchRepository } from '../../data';

export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Live search for the typed `input`.
 * - Debounced, and keyed by the normalised term, so revisited terms are
 *   instant and each term has its own cache entry.
 * - Superseded requests are cancelled through the query's AbortSignal.
 * - `results` only ever belong to the current input: while the debounced
 *   term lags behind what's typed, nothing stale is shown.
 * - Offline, falls back to filtering movies already in the cache.
 */
export function useMovieSearch(input: string) {
  const current = normaliseTerm(input);
  const term = useDebouncedValue(current, SEARCH_DEBOUNCE_MS);
  const isOnline = useIsOnline();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: searchKeys.livePage(term),
    queryFn: ({ signal }) => searchRepository.search(term, 1, signal),
    enabled: term.length > 0 && isOnline,
    staleTime: cachePolicy.search.staleTime,
  });

  const isCurrent = term === current;
  const offlineResults = useMemo(
    () =>
      !isOnline && current
        ? cachedMovies(queryClient).filter(m =>
            m.title.toLowerCase().includes(current),
          )
        : null,
    [isOnline, current, queryClient],
  );

  const results =
    offlineResults ?? (isCurrent ? query.data?.results : undefined);

  return {
    term: current,
    results,
    totalResults: offlineResults?.length ?? query.data?.totalResults,
    isSearching:
      current.length > 0 && !offlineResults && (!isCurrent || query.isFetching),
    isError: isCurrent && query.isError,
    isOffline: !isOnline,
    retry: query.refetch,
  };
}
