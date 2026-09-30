import { http, HttpResponse } from 'msw';

import {
  emptyPage,
  movieDetail,
  movieImages,
  movieVideos,
  upcomingPage1,
} from '../fixtures/movies';

export const TMDB = 'https://api.themoviedb.org/3';

/** Default happy-path handlers; override per test with `server.use(...)`. */
export const handlers = [
  http.get(`${TMDB}/discover/movie`, () => HttpResponse.json(upcomingPage1)),
  http.get(`${TMDB}/search/movie`, () => HttpResponse.json(emptyPage)),
  http.get(`${TMDB}/movie/:id/videos`, () => HttpResponse.json(movieVideos)),
  http.get(`${TMDB}/movie/:id/images`, () => HttpResponse.json(movieImages)),
  http.get(`${TMDB}/movie/:id`, () => HttpResponse.json(movieDetail)),
];
