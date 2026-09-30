import Config from 'react-native-config';

/**
 * App-owned settings. Everything a request or cache key depends on that the
 * API doesn't decide lives here, not at call sites.
 */
export const appConfig = {
  /** Response language for every API call; part of each cache key. */
  language: 'en-US',
  /**
   * Screens read from in-memory mock repositories unless `.env` sets
   * `USE_MOCK_DATA=false` (rebuild after changing it).
   */
  useMockData: Config.USE_MOCK_DATA !== 'false',
  /** "Upcoming" = releases from today up to this many days ahead. */
  upcomingWindowDays: 180,
} as const;
