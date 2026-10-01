import { tmdbClient, tmdbEndpoints } from '../../../services/tmdb';
import { toMoviePage } from '../../movies/data/mappers';
import type { SearchRepository } from '../domain/SearchRepository';
import { mockCategories } from './mockCategories';

export const tmdbSearchRepository: SearchRepository = {
  async search(term, page, signal) {
    const dto = await tmdbClient.request(
      tmdbEndpoints.searchMovies({ query: term, page }),
      signal,
    );
    return toMoviePage(dto);
  },
  async getByGenre(genreId, page, signal) {
    const dto = await tmdbClient.request(
      tmdbEndpoints.moviesByGenre({ genreId, page }),
      signal,
    );
    return toMoviePage(dto);
  },
  // TMDb has no category artwork; the curated tiles stay local.
  async getCategories() {
    return mockCategories;
  },
};
