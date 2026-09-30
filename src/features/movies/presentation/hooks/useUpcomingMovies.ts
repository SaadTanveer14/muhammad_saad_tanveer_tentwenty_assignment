import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { cachePolicy } from '../../../../app/cachePolicy';
import { appConfig } from '../../../../core/config';
import { movieKeys, moviesRepository } from '../../data';
import { upcomingDateRange } from '../../domain/upcomingDateRange';

export function useUpcomingMovies() {
  // Recomputed each render; it only changes when the calendar day does.
  const range = upcomingDateRange(appConfig.upcomingWindowDays);

  const query = useInfiniteQuery({
    queryKey: movieKeys.upcoming(range),
    queryFn: ({ pageParam, signal }) =>
      moviesRepository.getUpcoming({ page: pageParam, ...range }, signal),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: cachePolicy.upcoming.staleTime,
  });

  const movies = useMemo(() => {
    // Popularity order can shift between page requests; dedupe by id.
    const seen = new Set<number>();
    return (query.data?.pages ?? [])
      .flatMap(page => page.results)
      .filter(movie =>
        seen.has(movie.id) ? false : (seen.add(movie.id), true),
      );
  }, [query.data]);

  return { ...query, movies };
}
