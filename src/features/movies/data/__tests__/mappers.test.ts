import { http, HttpResponse } from 'msw';

import { movieDetail, upcomingPage1 } from '../../../../test/fixtures/movies';
import { TMDB } from '../../../../test/msw/handlers';
import { server } from '../../../../test/msw/server';
import { tmdbMoviesRepository } from '../tmdbMoviesRepository';

const range = { minDate: '2026-09-30', maxDate: '2027-03-29' };

describe('tmdbMoviesRepository', () => {
  it('maps upcoming movies to domain models, keeping pagination', async () => {
    const page = await tmdbMoviesRepository.getUpcoming({ page: 1, ...range });

    expect(page).toMatchObject({ page: 1, totalPages: 2, totalResults: 3 });
    expect(page.results[0]).toEqual({
      id: 1,
      title: 'Batman Begins',
      overview: 'A young Bruce Wayne...',
      releaseDate: '2005-06-15',
      poster: { uri: 'https://image.tmdb.org/t/p/w500/batman.jpg' },
      backdrop: { uri: 'https://image.tmdb.org/t/p/w780/batman-bg.jpg' },
      voteAverage: 7.7,
      genreIds: [28, 80],
    });
  });

  it('builds no image for null or empty paths', async () => {
    const page = await tmdbMoviesRepository.getUpcoming({ page: 1, ...range });

    expect(page.results[1].poster).toBeNull();
    expect(page.results[1].backdrop).toBeNull();
  });

  it('produces a typed parse error for a malformed payload', async () => {
    server.use(
      http.get(`${TMDB}/discover/movie`, () =>
        HttpResponse.json({ ...upcomingPage1, results: [{ id: 'nope' }] }),
      ),
    );

    await expect(
      tmdbMoviesRepository.getUpcoming({ page: 1, ...range }),
    ).rejects.toMatchObject({ name: 'ApiError', kind: 'parse' });
  });

  it('still returns details when the images request fails', async () => {
    server.use(
      http.get(`${TMDB}/movie/:id/images`, () =>
        HttpResponse.json(
          { status_message: 'boom', status_code: 1 },
          { status: 500 },
        ),
      ),
    );

    const detail = await tmdbMoviesRepository.getDetail(1);
    expect(detail).toMatchObject({
      title: 'Batman Begins',
      genres: [{ id: 28, name: 'Action' }],
      runtimeMinutes: 140,
      backdrop: { uri: 'https://image.tmdb.org/t/p/w780/batman-bg.jpg' },
    });
  });

  it('falls back to the images backdrop when details have none', async () => {
    server.use(
      http.get(`${TMDB}/movie/:id`, () =>
        HttpResponse.json({ ...movieDetail, backdrop_path: null }),
      ),
    );

    const detail = await tmdbMoviesRepository.getDetail(1);
    expect(detail.backdrop).toEqual({
      uri: 'https://image.tmdb.org/t/p/w780/images-backdrop.jpg',
    });
  });

  it('drops videos that have no key, and an empty list is not an error', async () => {
    server.use(
      http.get(`${TMDB}/movie/:id/videos`, () =>
        HttpResponse.json({
          id: 1,
          results: [{ id: 'x', key: null, site: 'YouTube', type: 'Trailer' }],
        }),
      ),
    );

    await expect(tmdbMoviesRepository.getVideos(1)).resolves.toEqual([]);
  });
});
