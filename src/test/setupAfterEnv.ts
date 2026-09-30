import { onlineManager } from '@tanstack/react-query';

import { server } from './msw/server';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  server.resetHandlers();
  onlineManager.setOnline(true);
});
afterAll(() => server.close());
