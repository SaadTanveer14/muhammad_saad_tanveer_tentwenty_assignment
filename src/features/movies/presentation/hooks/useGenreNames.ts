import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { cachePolicy } from '../../../../app/cachePolicy';
import { movieKeys, moviesRepository } from '../../data';

/** Resolves genre ids (list/search results) to display names. */
export function useGenreNames() {
  const { data } = useQuery({
    queryKey: movieKeys.genres(),
    queryFn: ({ signal }) => moviesRepository.getGenres(signal),
    staleTime: cachePolicy.detail.staleTime,
  });
  return useCallback(
    (ids: number[]) =>
      ids
        .map(id => data?.find(g => g.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [data],
  );
}
