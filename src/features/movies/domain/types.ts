import type { ImageSource } from '../../../core/types';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  /** ISO date (YYYY-MM-DD) or null when unknown. */
  releaseDate: string | null;
  poster: ImageSource | null;
  backdrop: ImageSource | null;
  voteAverage: number;
  genreIds: number[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetail extends Omit<Movie, 'genreIds'> {
  genres: Genre[];
  runtimeMinutes: number | null;
  tagline: string | null;
  /** Title artwork shown on the hero; the title text is used when absent. */
  logo: ImageSource | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  publishedAt: string | null;
}

export interface Page<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}
