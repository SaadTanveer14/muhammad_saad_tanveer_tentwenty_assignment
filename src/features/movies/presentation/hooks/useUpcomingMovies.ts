import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { cachePolicy } from '../../../../app/cachePolicy';
import { movieKeys, moviesRepository } from '../../data';

export function useUpcomingMovies() {
  const query = useInfiniteQuery({
    queryKey: movieKeys.upcoming(),
    queryFn: ({ pageParam, signal }) =>
      moviesRepository.getUpcoming(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: cachePolicy.upcoming.staleTime,
  });

  const movies = useMemo(() => {
    // Pages can overlap when TMDb reshuffles between requests; dedupe by id.
    const seen = new Set<number>();
    return (query.data?.pages ?? [])
      .flatMap(page => page.results)
      .filter(movie =>
        seen.has(movie.id) ? false : (seen.add(movie.id), true),
      );
  }, [query.data]);

  return { ...query, movies };
}
