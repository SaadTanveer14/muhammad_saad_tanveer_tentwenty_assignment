/**
 * Every failure that crosses the data layer boundary is normalised into an
 * `ApiError`, so presentation code only ever has to switch on `kind`.
 */
export type ApiErrorKind =
  | 'network' // request never reached the server (offline, DNS, timeout)
  | 'http' // server answered with an error status or an error body
  | 'parse' // response did not match the expected schema
  | 'aborted'; // superseded / cancelled request

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status, when the server answered. */
  readonly status?: number;
  /** Server-specific error code from the body (e.g. TMDb `status_code`). */
  readonly code?: number;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options?: { status?: number; code?: number; cause?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options?.status;
    this.code = options?.code;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
