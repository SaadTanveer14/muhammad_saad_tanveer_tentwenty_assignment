import { http, HttpResponse } from 'msw';

import { server } from '../../../../test/msw/server';
import { TMDB } from '../../../../test/msw/handlers';
import { upcomingPage1 } from '../../../../test/fixtures/movies';
import { tmdbMoviesRepository } from '../tmdbMoviesRepository';

const fetchUpcomingMovies = (page: number) =>
  tmdbMoviesRepository.getUpcoming(page);

describe('tmdbMoviesRepository.getUpcoming', () => {
  it('maps TMDb DTOs to domain movies', async () => {
    const page = await fetchUpcomingMovies(1);

    expect(page.totalPages).toBe(2);
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

  it('normalises missing and empty image paths to null', async () => {
    const page = await fetchUpcomingMovies(1);

    expect(page.results[1].poster).toBeNull();
    expect(page.results[1].backdrop).toBeNull();
  });

  it('produces a typed parse error for a malformed DTO instead of crashing', async () => {
    server.use(
      http.get(`${TMDB}/movie/upcoming`, () =>
        HttpResponse.json({
          ...upcomingPage1,
          results: [{ id: 'not-a-number' }],
        }),
      ),
    );

    await expect(fetchUpcomingMovies(1)).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'parse',
    });
  });
});
