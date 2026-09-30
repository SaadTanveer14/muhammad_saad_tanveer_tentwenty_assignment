import { useQuery } from '@tanstack/react-query';

import { cachePolicy } from '../../../../app/cachePolicy';
import { pickTrailer } from '../../../trailer/domain/pickTrailer';
import { movieKeys, moviesRepository } from '../../data';

export function useMovieTrailer(movieId: number) {
  return useQuery({
    queryKey: movieKeys.videos(movieId),
    queryFn: ({ signal }) => moviesRepository.getVideos(movieId, signal),
    staleTime: cachePolicy.detail.staleTime,
    select: pickTrailer,
  });
}
