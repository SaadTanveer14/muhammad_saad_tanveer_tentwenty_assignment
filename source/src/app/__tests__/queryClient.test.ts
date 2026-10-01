import { QueryClient } from '@tanstack/react-query';

import { shouldPersistQuery } from '../queryClient';

jest.mock('../../core/config', () => ({
  appConfig: { language: 'en-US', useMockData: false, upcomingWindowDays: 180 },
}));

function cachedQuery(key: readonly unknown[], meta?: Record<string, unknown>) {
  const client = new QueryClient();
  const query = client.getQueryCache().build(client, { queryKey: key, meta });
  query.setData({ ok: true });
  return query;
}

describe('shouldPersistQuery (TMDb mode)', () => {
  it('persists successful API data', () => {
    expect(shouldPersistQuery(cachedQuery(['movies', 'upcoming']))).toBe(true);
  });

  it('never persists queries that opt out (bundled-image data like genre tiles)', () => {
    expect(
      shouldPersistQuery(
        cachedQuery(['search', 'categories'], { persist: false }),
      ),
    ).toBe(false);
  });
});
