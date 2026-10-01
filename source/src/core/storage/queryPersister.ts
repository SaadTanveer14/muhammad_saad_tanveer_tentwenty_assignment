import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

import { storage } from './mmkv';

const clientStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

export const QUERY_CACHE_KEY = 'cinebook-query-cache';

export const queryPersister = createSyncStoragePersister({
  storage: clientStorage,
  key: QUERY_CACHE_KEY,
  throttleTime: 1000,
});
