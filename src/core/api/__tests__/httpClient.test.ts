import { http, HttpResponse } from 'msw';
import { z } from 'zod';

import { server } from '../../../test/msw/server';
import { TMDB } from '../../../test/msw/handlers';
import { ApiError } from '../errors';
import { get } from '../httpClient';

const schema = z.object({ ok: z.boolean() });

describe('httpClient.get', () => {
  it('sends the bearer token and returns validated data', async () => {
    let auth: string | null = null;
    server.use(
      http.get(`${TMDB}/ping`, ({ request }) => {
        auth = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
      }),
    );

    await expect(get('/ping', { schema })).resolves.toEqual({ ok: true });
    expect(auth).toBe('Bearer test-token');
  });

  it('throws an http ApiError with the status for non-2xx responses', async () => {
    server.use(
      http.get(`${TMDB}/ping`, () => new HttpResponse(null, { status: 404 })),
    );

    await expect(get('/ping', { schema })).rejects.toMatchObject({
      kind: 'http',
      status: 404,
    });
  });

  it('throws a parse ApiError when the response shape is wrong', async () => {
    server.use(
      http.get(`${TMDB}/ping`, () => HttpResponse.json({ ok: 'yes' })),
    );

    const error = await get('/ping', { schema }).catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe('parse');
  });

  it('throws a network ApiError when the request cannot be made', async () => {
    server.use(http.get(`${TMDB}/ping`, () => HttpResponse.error()));

    await expect(get('/ping', { schema })).rejects.toMatchObject({
      kind: 'network',
    });
  });
});
