import { useQuery } from '@tanstack/react-query';

import { cachePolicy } from '../../../../app/cachePolicy';
import { showtimeKeys, showtimesRepository } from '../../data';

export function useShowDates(movieId: number) {
  return useQuery({
    queryKey: showtimeKeys.dates(movieId),
    queryFn: ({ signal }) => showtimesRepository.getDates(movieId, signal),
    staleTime: cachePolicy.search.staleTime,
  });
}

export function useShowtimes(movieId: number, date: string | undefined) {
  return useQuery({
    queryKey: showtimeKeys.list(movieId, date ?? ''),
    queryFn: ({ signal }) =>
      showtimesRepository.getShowtimes(movieId, date!, signal),
    enabled: Boolean(date),
    staleTime: cachePolicy.search.staleTime,
  });
}

export function useShowtime(showtimeId: string) {
  return useQuery({
    queryKey: showtimeKeys.detail(showtimeId),
    queryFn: ({ signal }) =>
      showtimesRepository.getShowtime(showtimeId, signal),
    staleTime: cachePolicy.search.staleTime,
  });
}
