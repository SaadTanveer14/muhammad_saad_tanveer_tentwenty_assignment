import { useQuery, useQueryClient } from '@tanstack/react-query';

import { cachePolicy } from '../../../../app/cachePolicy';
import { movieKeys, moviesRepository } from '../../data';
import type { MovieDetail } from '../../domain/types';
import { cachedMovies } from './cachedMovies';

/**
 * Movie detail. While it loads, the list item already in the cache is used
 * as placeholder data so the hero renders without a gap.
 */
export function useMovieDetail(movieId: number) {
  const queryClient = useQueryClient();
  return useQuery<MovieDetail>({
    queryKey: movieKeys.detail(movieId),
    queryFn: ({ signal }) => moviesRepository.getDetail(movieId, signal),
    staleTime: cachePolicy.detail.staleTime,
    placeholderData: () => {
      const movie = cachedMovies(queryClient).find(m => m.id === movieId);
      if (!movie) {
        return undefined;
      }
      return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.releaseDate,
        poster: movie.poster,
        backdrop: movie.backdrop,
        voteAverage: movie.voteAverage,
        genres: [],
        runtimeMinutes: null,
        tagline: null,
        logo: null,
      };
    },
  });
}
