import type { ZodType } from 'zod';

import { apiConfig } from './config';
import { ApiError } from './errors';

type QueryParams = Record<string, string | number | boolean | undefined>;

export interface RequestOptions<T> {
  schema: ZodType<T>;
  params?: QueryParams;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: QueryParams): string {
  const query = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
  return `${apiConfig.baseUrl}${path}${query ? `?${query}` : ''}`;
}

/**
 * GET a TMDb resource and validate it against `schema`.
 * This is the single place where raw network responses are turned into
 * typed data or an `ApiError`.
 */
export async function get<T>(
  path: string,
  { schema, params, signal }: RequestOptions<T>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
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
