import { ApiError } from '../../../core/api';
import { mockGenres, mockMovies } from '../../../mocks/catalog';
import { mockDelay } from '../../../mocks/delay';
import type { MoviesRepository } from '../domain/MoviesRepository';
import type { Movie, MovieDetail, Page } from '../domain/types';

export const MOCK_PAGE_SIZE = 4;

export function toListMovie(detail: MovieDetail): Movie {
  return {
    id: detail.id,
    title: detail.title,
    overview: detail.overview,
    releaseDate: detail.releaseDate,
    poster: detail.poster,
    backdrop: detail.backdrop,
    voteAverage: detail.voteAverage,
    genreIds: detail.genres.map(g => g.id),
  };
}

export function paginate<T>(items: T[], page: number, size: number): Page<T> {
  const start = (page - 1) * size;
  return {
    page,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    totalResults: items.length,
    results: items.slice(start, start + size),
  };
}

function findMovie(id: number) {
  const movie = mockMovies.find(m => m.detail.id === id);
  if (!movie) {
    throw new ApiError('http', `Movie ${id} not found`, { status: 404 });
  }
  return movie;
}

export const mockMoviesRepository: MoviesRepository = {
  async getUpcoming({ page }, signal) {
    await mockDelay(signal);
    return paginate(
      mockMovies.map(m => toListMovie(m.detail)),
      page,
      MOCK_PAGE_SIZE,
    );
  },
  async getDetail(id, signal) {
    await mockDelay(signal);
    return findMovie(id).detail;
  },
  async getVideos(id, signal) {
    await mockDelay(signal);
    return findMovie(id).videos;
  },
  async getGenres(signal) {
    await mockDelay(signal);
    return mockGenres;
  },
};
