#!/usr/bin/env node
/**
 * Live check of every TMDb operation the app uses, with the same parameters.
 * Reads TMDB_READ_TOKEN from .env; prints statuses and counts, never the token.
 *   node scripts/tmdb-smoke.mjs
 */
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => [
      line.slice(0, line.indexOf('=')),
      line.slice(line.indexOf('=') + 1).trim(),
    ]),
);
const token = env.TMDB_READ_TOKEN;
if (!token || token.startsWith('your_')) {
  console.error('Set TMDB_READ_TOKEN in .env first.');
  process.exit(1);
}
const base = (env.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3').replace(
  /\/+$/,
  '',
);

async function get(path, params = {}) {
  const url = new URL(`${base}${path}`);
  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(k, String(v)),
  );
  const res = await fetch(url, {
    headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

const today = new Date().toISOString().slice(0, 10);
const later = new Date(Date.now() + 180 * 864e5).toISOString().slice(0, 10);
const common = { include_adult: false, language: 'en-US', page: 1 };

const upcoming = await get('/discover/movie', {
  ...common,
  include_video: false,
  sort_by: 'popularity.desc',
  with_release_type: '2|3',
  'release_date.gte': today,
  'release_date.lte': later,
});
console.log(
  'Upcoming',
  upcoming.status,
  `${upcoming.body?.results?.length} results, ${upcoming.body?.total_pages} pages`,
);

const search = await get('/search/movie', { ...common, query: 'inception' });
console.log('Search  ', search.status, `${search.body?.total_results} results`);

const id = upcoming.body?.results?.[0]?.id;
if (!id) {
  process.exit(upcoming.status === 200 ? 0 : 1);
}
const [details, videos, images] = await Promise.all([
  get(`/movie/${id}`, { language: 'en-US' }),
  get(`/movie/${id}/videos`, { language: 'en-US' }),
  get(`/movie/${id}/images`),
]);
console.log('Details ', details.status, details.body?.title);
console.log(
  'Videos  ',
  videos.status,
  `${videos.body?.results?.length} videos`,
);
console.log(
  'Images  ',
  images.status,
  `${images.body?.backdrops?.length} backdrops`,
);
const failed = [upcoming, search, details, videos, images].some(
  r => r.status !== 200,
);
process.exit(failed ? 1 : 0);
