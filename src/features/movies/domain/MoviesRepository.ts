import type { Genre, Movie, MovieDetail, Page, Video } from './types';

/** What the movie screens need, independent of where the data comes from. */
export interface MoviesRepository {
  getUpcoming(page: number, signal?: AbortSignal): Promise<Page<Movie>>;
  getDetail(id: number, signal?: AbortSignal): Promise<MovieDetail>;
  getVideos(id: number, signal?: AbortSignal): Promise<Video[]>;
  getGenres(signal?: AbortSignal): Promise<Genre[]>;
}
