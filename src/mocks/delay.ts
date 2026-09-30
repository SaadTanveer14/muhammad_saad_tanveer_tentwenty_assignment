import { ApiError } from '../core/api';

/** Simulated network latency. 0 for now so the UI renders instantly; raise it to see loading states. */
export const MOCK_LATENCY_MS = 0;

/**
 * Resolves after `ms`, or rejects with an `aborted` ApiError as soon as
 * `signal` fires — the same contract as a cancelled real request.
 */
export function mockDelay(
  signal?: AbortSignal,
  ms: number = MOCK_LATENCY_MS,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ApiError('aborted', 'Request was cancelled'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(new ApiError('aborted', 'Request was cancelled'));
    }
    signal?.addEventListener('abort', onAbort);
  });
}
