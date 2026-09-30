import { type Query, QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

import { isApiError } from '../core/api';
import { appConfig } from '../core/config';
import { queryPersister } from '../core/storage';
import { cachePolicy } from './cachePolicy';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Must be >= persister maxAge or restored entries are garbage-collected.
        gcTime: cachePolicy.maxAge,
        // Offline: pause instead of failing; resume on reconnect.
        networkMode: 'online',
        retry: (failureCount, error) => {
          if (
            isApiError(error) &&
            (error.kind === 'parse' || error.status === 404)
          ) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** Search results are only kept on disk for a day; everything else for a week. */
function shouldPersistQuery(query: Query): boolean {
  // Mock data references bundled images by module id, which changes between
  // bundles, so it must never be written to disk.
  if (appConfig.useMockData) {
    return false;
  }
  if (query.state.status !== 'success') {
    return false;
  }
  if (query.queryKey[0] === 'search') {
    return (
      Date.now() - query.state.dataUpdatedAt < cachePolicy.search.persistFor
    );
  }
  return true;
}

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: queryPersister,
  maxAge: cachePolicy.maxAge,
  // Bump when cached data shapes change to discard incompatible caches.
  // Includes the data source so mock data never survives a switch to TMDb.
  buster: `v3-${appConfig.useMockData ? 'mock' : 'tmdb'}`,
  dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
};
