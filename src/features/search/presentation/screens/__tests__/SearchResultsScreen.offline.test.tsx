import { onlineManager } from '@tanstack/react-query';
import { cleanup, screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../../test/renderWithProviders';
import { SearchResultsScreen } from '../SearchResultsScreen';

describe('SearchResultsScreen offline', () => {
  beforeEach(() => onlineManager.setOnline(false));
  // Unmount before the global teardown flips back online, so the
  // connectivity change doesn't update a still-mounted screen.
  afterEach(async () => {
    await cleanup();
  });

  it('shows the offline state instead of endless skeletons for an uncached search', async () => {
    const props = {
      navigation: { goBack: jest.fn(), navigate: jest.fn() },
      route: {
        key: 'results',
        name: 'SearchResults',
        params: { query: 'batman' },
      },
    } as unknown as React.ComponentProps<typeof SearchResultsScreen>;

    await renderWithProviders(<SearchResultsScreen {...props} />);

    expect(screen.getByText("You're offline")).toBeOnTheScreen();
    expect(screen.getByText('Results')).toBeOnTheScreen();
    expect(screen.queryByTestId('results-loading')).toBeNull();
    expect(screen.queryByText('Searching…')).toBeNull();
  });
});
