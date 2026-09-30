import type { ZodType } from 'zod';

import { apiConfig } from './config';
import { ApiError } from './errors';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * A request described as data: what to call and how to validate the answer.
 * API modules build these; the client executes them. This is the shape
 * every future API integration (not just TMDb) should target.
 */
export interface Endpoint<T> {
  method?: HttpMethod;
  /** Path relative to the client's base URL, e.g. `/movie/550`. */
  path: string;
  /** `undefined`/`null` values are dropped. */
  params?: QueryParams;
  body?: unknown;
  /** The response is validated against this; failures become `parse` errors. */
  schema: ZodType<T>;
}

/** Server-reported error details extracted from a response body. */
export interface ServerError {
  message: string;
  code?: number;
}

export interface HttpClientConfig {
  baseUrl: string;
  /** Called per request, so rotating credentials are always current. */
  headers?: () => Record<string, string>;
  /**
   * Recognises an error payload (on any status, including 2xx) and extracts
   * its message. Return `null` when the body isn't an error.
   */
  parseServerError?: (body: unknown) => ServerError | null;
}

export interface HttpClient {
  request<T>(endpoint: Endpoint<T>, signal?: AbortSignal): Promise<T>;
}

/** Joins a base URL and path with exactly one slash, then appends params. */
export function buildUrl(
  baseUrl: string,
  path: string,
  params?: QueryParams,
): string {
  const url = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  const query = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
  return query ? `${url}?${query}` : url;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ApiError('parse', 'Response was not valid JSON', {
      status: response.status,
      cause,
    });
  }
}

/**
 * Generic JSON client: every response is validated, and every failure is an
 * `ApiError` (`network` | `http` | `parse` | `aborted`). Headers are never
 * included in errors, so credentials can't leak into logs.
 *
 * This replaces the TMDb-specific `get()` below; call sites will move over
 * incrementally, and the legacy function will be deleted once nothing uses
 * it (see the commit that retires it).
 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
  return {
    async request<T>(endpoint: Endpoint<T>, signal?: AbortSignal): Promise<T> {
      const method = endpoint.method ?? 'GET';
      let response: Response;
      try {
        response = await fetch(
          buildUrl(config.baseUrl, endpoint.path, endpoint.params),
          {
            method,
            headers: {
              accept: 'application/json',
              ...(endpoint.body !== undefined && {
                'content-type': 'application/json',
              }),
              ...config.headers?.(),
            },
            body:
              endpoint.body !== undefined
                ? JSON.stringify(endpoint.body)
                : undefined,
            signal,
          },
        );
      } catch (cause) {
        if (signal?.aborted) {
          throw new ApiError('aborted', 'Request was cancelled', { cause });
        }
        throw new ApiError('network', 'Network request failed', { cause });
      }

      const body = await readJson(response);
      const serverError = config.parseServerError?.(body) ?? null;
      if (!response.ok || serverError) {
        throw new ApiError(
          'http',
          serverError?.message ?? `Request failed with ${response.status}`,
          { status: response.status, code: serverError?.code },
        );
      }

      const result = endpoint.schema.safeParse(body);
      if (!result.success) {
        throw new ApiError(
          'parse',
          `Unexpected response shape for ${method} ${endpoint.path}`,
          { status: response.status, cause: result.error },
        );
      }
      return result.data;
    },
  };
}

// --- Legacy TMDb-specific client -------------------------------------------
// Pre-dates `createHttpClient`. Existing call sites still use this; new ones
// should use `createHttpClient` instead. Deleted once nothing calls it.

export interface RequestOptions<T> {
  schema: ZodType<T>;
  params?: QueryParams;
  signal?: AbortSignal;
}

/**
 * GET a TMDb resource and validate it against `schema`.
 */
export async function get<T>(
  path: string,
  { schema, params, signal }: RequestOptions<T>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(apiConfig.baseUrl, path, params), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiConfig.readToken}`,
      },
      signal,
    });
  } catch (cause) {
    if (signal?.aborted) {
      throw new ApiError('aborted', 'Request was cancelled', { cause });
    }
    throw new ApiError('network', 'Network request failed', { cause });
  }

  if (!response.ok) {
    throw new ApiError('http', `Request failed with ${response.status}`, {
      status: response.status,
    });
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (cause) {
    throw new ApiError('parse', 'Response was not valid JSON', { cause });
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    throw new ApiError('parse', `Unexpected response shape for ${path}`, {
      cause: result.error,
    });
  }
  return result.data;
}

export const httpClient = { get };
