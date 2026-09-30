import type { Genre, Movie, MovieDetail, Page, Video } from './types';

/** Upcoming = releases between two dates (YYYY-MM-DD), one page at a time. */
export interface UpcomingQuery {
  page: number;
  minDate: string;
  maxDate: string;
}

/** What the movie screens need, independent of where the data comes from. */
export interface MoviesRepository {
  getUpcoming(query: UpcomingQuery, signal?: AbortSignal): Promise<Page<Movie>>;
  /** Details plus images; image failures never fail the details. */
  getDetail(id: number, signal?: AbortSignal): Promise<MovieDetail>;
  getVideos(id: number, signal?: AbortSignal): Promise<Video[]>;
  getGenres(signal?: AbortSignal): Promise<Genre[]>;
}
