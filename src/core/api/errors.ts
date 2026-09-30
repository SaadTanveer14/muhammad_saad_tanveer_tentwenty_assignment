/**
 * Every failure that crosses the data layer boundary is normalised into an
 * `ApiError`, so presentation code only ever has to switch on `kind`.
 */
export type ApiErrorKind =
  | 'network' // request never reached the server (offline, DNS, timeout)
  | 'http' // server answered with a non-2xx status
  | 'parse' // response did not match the expected schema
  | 'aborted'; // superseded / cancelled request

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options?.status;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
