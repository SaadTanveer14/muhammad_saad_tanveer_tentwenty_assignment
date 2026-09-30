import { http, HttpResponse } from 'msw';

import { notFoundError, upcomingPage1 } from '../../../test/fixtures/movies';
import { TMDB } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import { tmdbClient } from '../client';
import { tmdbEndpoints } from '../endpoints';
import { buildImageUrl } from '../images';

/** Serves `body` at `path` and records the request URL. */
function capture(path: string, body: object) {
  const seen: { url?: URL; auth?: string | null } = {};
  server.use(
    http.get(`${TMDB}${path}`, ({ request }) => {
      seen.url = new URL(request.url);
      seen.auth = request.headers.get('Authorization');
      return HttpResponse.json(body);
    }),
  );
  return seen;
}

const params = (url?: URL) => Object.fromEntries(url?.searchParams ?? []);

describe('TMDb endpoints send the documented parameters', () => {
  it('Upcoming Movies → /discover/movie with the release window', async () => {
    const seen = capture('/discover/movie', upcomingPage1);

    await tmdbClient.request(
      tmdbEndpoints.upcomingMovies({
        page: 2,
        minDate: '2026-09-30',
        maxDate: '2027-03-29',
      }),
    );

    expect(params(seen.url)).toEqual({
      include_adult: 'false',
      include_video: 'false',
      language: 'en-US',
      page: '2',
      sort_by: 'popularity.desc',
      with_release_type: '2|3',
      'release_date.gte': '2026-09-30',
      'release_date.lte': '2027-03-29',
    });
    expect(seen.auth).toBe('Bearer test-token');
  });

  it('Search Movies → /search/movie with query and page', async () => {
    const seen = capture('/search/movie', upcomingPage1);

    await tmdbClient.request(
      tmdbEndpoints.searchMovies({ query: 'inception', page: 3 }),
    );

    expect(params(seen.url)).toEqual({
      query: 'inception',
      include_adult: 'false',
      language: 'en-US',
      page: '3',
    });
  });

  it('Details and Videos send language; Images sends nothing extra', async () => {
    const details = capture('/movie/550', { id: 550, title: 'Fight Club' });
    const videos = capture('/movie/550/videos', { id: 550, results: [] });
    const images = capture('/movie/550/images', { backdrops: [] });

    await Promise.all([
      tmdbClient.request(tmdbEndpoints.movieDetails(550)),
      tmdbClient.request(tmdbEndpoints.movieVideos(550)),
      tmdbClient.request(tmdbEndpoints.movieImages(550)),
    ]);

    expect(params(details.url)).toEqual({ language: 'en-US' });
    expect(params(videos.url)).toEqual({ language: 'en-US' });
    expect(params(images.url)).toEqual({});
  });

  it('refuses to call dependent endpoints without a real movie id', () => {
    expect(() => tmdbEndpoints.movieDetails(0)).toThrow('Invalid movie id');
    expect(() => tmdbEndpoints.movieVideos(Number.NaN)).toThrow();
  });

  it('surfaces TMDb’s error message and status_code', async () => {
    server.use(
      http.get(`${TMDB}/movie/404`, () =>
        HttpResponse.json(notFoundError, { status: 404 }),
      ),
    );

    await expect(
      tmdbClient.request(tmdbEndpoints.movieDetails(404)),
    ).rejects.toMatchObject({
      kind: 'http',
      status: 404,
      code: 34,
      message: 'The resource you requested could not be found.',
    });
  });
});

describe('buildImageUrl', () => {
  it('joins base, size and path with single slashes', () => {
    expect(buildImageUrl('/abc123.jpg', 'w500')).toBe(
      'https://image.tmdb.org/t/p/w500/abc123.jpg',
    );
    expect(buildImageUrl('abc123.jpg', 'w780')).toBe(
      'https://image.tmdb.org/t/p/w780/abc123.jpg',
    );
  });

  it('builds nothing for missing media', () => {
    expect(buildImageUrl(null, 'w500')).toBeNull();
    expect(buildImageUrl('', 'w500')).toBeNull();
  });
});
