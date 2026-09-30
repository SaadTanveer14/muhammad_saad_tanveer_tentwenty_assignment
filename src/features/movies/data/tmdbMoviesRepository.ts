import { isApiError } from '../../../core/api';
import {
  TMDB_MOVIE_GENRES,
  tmdbClient,
  tmdbEndpoints,
} from '../../../services/tmdb';
import type { MoviesRepository } from '../domain/MoviesRepository';
import { toMovieDetail, toMoviePage, toVideos } from './mappers';

export const tmdbMoviesRepository: MoviesRepository = {
  async getUpcoming(query, signal) {
    const dto = await tmdbClient.request(
      tmdbEndpoints.upcomingMovies(query),
      signal,
    );
    return toMoviePage(dto);
  },

  async getDetail(id, signal) {
    // Independent requests, in parallel. Images are optional: if they fail,
    // the details still render (cancellation is still propagated).
    const [details, images] = await Promise.all([
      tmdbClient.request(tmdbEndpoints.movieDetails(id), signal),
      tmdbClient
        .request(tmdbEndpoints.movieImages(id), signal)
        .catch((error: unknown) => {
          if (isApiError(error) && error.kind === 'aborted') {
            throw error;
          }
          return null;
        }),
    ]);
    return toMovieDetail(details, images);
  },

  async getVideos(id, signal) {
    const dto = await tmdbClient.request(tmdbEndpoints.movieVideos(id), signal);
    return toVideos(dto);
  },

  async getGenres() {
    return TMDB_MOVIE_GENRES.map(g => ({ id: g.id, name: g.name }));
  },
};
