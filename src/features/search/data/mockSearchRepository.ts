import { mockMovies } from '../../../mocks/catalog';
import { mockDelay } from '../../../mocks/delay';
import { paginate, toListMovie } from '../../movies/data/mockMoviesRepository';
import type { SearchRepository } from '../domain/SearchRepository';
import { mockCategories } from './mockCategories';

const PAGE_SIZE = 20;
const allMovies = () => mockMovies.map(m => toListMovie(m.detail));

export const mockSearchRepository: SearchRepository = {
  async search(term, page, signal) {
    await mockDelay(signal);
    const matches = allMovies().filter(m =>
      m.title.toLowerCase().includes(term),
    );
    return paginate(matches, page, PAGE_SIZE);
  },
  async getByGenre(genreId, page, signal) {
    await mockDelay(signal);
    const matches = allMovies().filter(m => m.genreIds.includes(genreId));
    return paginate(matches, page, PAGE_SIZE);
  },
  async getCategories(signal) {
    await mockDelay(signal);
    return mockCategories;
  },
};
