import { httpClient } from '../../../core/api';
import { moviePageDto } from '../../movies/data/dto';
import { toMoviePage } from '../../movies/data/mappers';
import type { SearchRepository } from '../domain/SearchRepository';
import { mockCategories } from './mockCategories';

export const tmdbSearchRepository: SearchRepository = {
  async search(term, page, signal) {
    const dto = await httpClient.get('/search/movie', {
      schema: moviePageDto,
      params: { query: term, page, include_adult: false, language: 'en-US' },
      signal,
    });
    return toMoviePage(dto);
  },
  async getByGenre(genreId, page, signal) {
    const dto = await httpClient.get('/discover/movie', {
      schema: moviePageDto,
      params: { with_genres: genreId, page, language: 'en-US' },
      signal,
    });
    return toMoviePage(dto);
  },
  // TMDb has no category artwork; the curated tiles stay local.
  async getCategories() {
    return mockCategories;
  },
};
