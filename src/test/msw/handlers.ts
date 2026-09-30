import { http, HttpResponse } from 'msw';

import { upcomingPage1, movieDetail, movieVideos } from '../fixtures/movies';

export const TMDB = 'https://api.themoviedb.org/3';

/** Default happy-path handlers; override per test with `server.use(...)`. */
export const handlers = [
  http.get(`${TMDB}/movie/upcoming`, () => HttpResponse.json(upcomingPage1)),
  http.get(`${TMDB}/movie/:id/videos`, () => HttpResponse.json(movieVideos)),
  http.get(`${TMDB}/movie/:id`, () => HttpResponse.json(movieDetail)),
  http.get(`${TMDB}/search/movie`, () =>
    HttpResponse.json({
      page: 1,
      total_pages: 1,
      total_results: 0,
      results: [],
    }),
  ),
];
