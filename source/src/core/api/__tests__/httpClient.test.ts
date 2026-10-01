import { http, HttpResponse } from 'msw';
import { z } from 'zod';

import { server } from '../../../test/msw/server';
import { ApiError } from '../errors';
import { buildUrl, createHttpClient } from '../httpClient';

const BASE = 'https://api.example.com/v1';
const schema = z.object({ ok: z.boolean() });
const ping = { path: '/ping', schema };

const client = createHttpClient({
  baseUrl: BASE,
  headers: () => ({ Authorization: 'Bearer secret' }),
  parseServerError: body =>
    body && typeof body === 'object' && 'error' in body
      ? { message: String((body as { error: string }).error), code: 7 }
      : null,
});

describe('buildUrl', () => {
  it('joins base and path with exactly one slash', () => {
    expect(buildUrl('https://a.b/3/', '/movie/1')).toBe(
      'https://a.b/3/movie/1',
    );
    expect(buildUrl('https://a.b/3', 'movie/1')).toBe('https://a.b/3/movie/1');
  });

  it('encodes params and drops empty ones', () => {
    expect(
      buildUrl('https://a.b', '/x', {
        q: 'a b',
        'release_date.gte': '2026-01-01',
        with_release_type: '2|3',
        skip: undefined,
        none: null,
      }),
    ).toBe(
      'https://a.b/x?q=a%20b&release_date.gte=2026-01-01&with_release_type=2%7C3',
    );
  });
});

describe('createHttpClient', () => {
  it('sends the configured headers and returns validated data', async () => {
    let auth: string | null = null;
    let accept: string | null = null;
    server.use(
      http.get(`${BASE}/ping`, ({ request }) => {
        auth = request.headers.get('Authorization');
        accept = request.headers.get('accept');
        return HttpResponse.json({ ok: true });
      }),
    );

    await expect(client.request(ping)).resolves.toEqual({ ok: true });
    expect(auth).toBe('Bearer secret');
    expect(accept).toBe('application/json');
  });

  it('uses the server’s error message and code for error statuses', async () => {
    server.use(
      http.get(`${BASE}/ping`, () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );

    await expect(client.request(ping)).rejects.toMatchObject({
      kind: 'http',
      status: 404,
      code: 7,
      message: 'Not found',
    });
  });

  it('treats an error body as a failure even with a 200 status', async () => {
    server.use(
      http.get(`${BASE}/ping`, () => HttpResponse.json({ error: 'Nope' })),
    );

    await expect(client.request(ping)).rejects.toMatchObject({
      kind: 'http',
      message: 'Nope',
    });
  });

  it('throws a parse error when the shape is wrong', async () => {
    server.use(
      http.get(`${BASE}/ping`, () => HttpResponse.json({ ok: 'yes' })),
    );

    const error = await client.request(ping).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe('parse');
  });

  it('throws a network error when the request cannot be made', async () => {
    server.use(http.get(`${BASE}/ping`, () => HttpResponse.error()));

    await expect(client.request(ping)).rejects.toMatchObject({
      kind: 'network',
    });
  });

  it('never puts credentials in error messages', async () => {
    server.use(
      http.get(`${BASE}/ping`, () => new HttpResponse(null, { status: 401 })),
    );

    const error = (await client
      .request(ping)
      .catch((e: unknown) => e)) as ApiError;
    expect(error.message).not.toContain('secret');
  });
});
