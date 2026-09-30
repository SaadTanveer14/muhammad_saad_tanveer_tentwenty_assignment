import type { Movie, Page } from '../../movies/domain/types';
import type { Category } from './types';

export interface SearchRepository {
  /** `term` is already normalised (trimmed, lower-cased). */
  search(
    term: string,
    page: number,
    signal?: AbortSignal,
  ): Promise<Page<Movie>>;
  getByGenre(
    genreId: number,
    page: number,
    signal?: AbortSignal,
  ): Promise<Page<Movie>>;
  getCategories(signal?: AbortSignal): Promise<Category[]>;
}
