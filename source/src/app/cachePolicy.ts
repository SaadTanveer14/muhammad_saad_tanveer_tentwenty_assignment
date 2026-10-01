const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Per-resource freshness and persistence windows (see project plan §3). */
export const cachePolicy = {
  upcoming: { staleTime: 1 * HOUR, persistFor: 7 * DAY },
  detail: { staleTime: 24 * HOUR, persistFor: 7 * DAY },
  search: { staleTime: 5 * MINUTE, persistFor: 1 * DAY },
  /** Upper bound for anything persisted; also the in-memory gcTime. */
  maxAge: 7 * DAY,
} as const;
