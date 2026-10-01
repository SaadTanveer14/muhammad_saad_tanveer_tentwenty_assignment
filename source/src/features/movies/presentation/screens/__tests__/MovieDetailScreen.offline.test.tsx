import { onlineManager } from '@tanstack/react-query';
import { cleanup, screen } from '@testing-library/react-native';
import React from 'react';

import {
  createTestQueryClient,
  renderWithProviders,
} from '../../../../../test/renderWithProviders';
import type { Movie } from '../../../domain/types';
import { MovieDetailScreen } from '../MovieDetailScreen';

const movie: Movie = {
  id: 42,
  title: 'Cached Movie',
  overview: 'Seen in the list before going offline.',
  releaseDate: '2021-08-11',
  poster: null,
  backdrop: null,
  voteAverage: 7,
  genreIds: [35],
};

function renderDetail(queryClient = createTestQueryClient()) {
  const props = {
    navigation: { goBack: jest.fn(), navigate: jest.fn() },
    route: {
      key: 'detail',
      name: 'MovieDetail',
      params: { movieId: movie.id },
    },
  } as unknown as React.ComponentProps<typeof MovieDetailScreen>;
  return renderWithProviders(<MovieDetailScreen {...props} />, { queryClient });
}

describe('MovieDetailScreen offline', () => {
  beforeEach(() => onlineManager.setOnline(false));
  // Unmount before the global teardown flips back online, so the
  // connectivity change doesn't update a still-mounted screen.
  afterEach(async () => {
    await cleanup();
  });

  it('shows the offline state instead of an endless skeleton when nothing is cached', async () => {
    await renderDetail();

    expect(screen.getByText("You're offline")).toBeOnTheScreen();
    expect(screen.queryByTestId('movie-detail-loading')).toBeNull();
  });

  it('shows cached list data without a spinning trailer button or endless genre skeletons', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['movies', 'upcoming', 'cached'], {
      pages: [{ page: 1, totalPages: 1, totalResults: 1, results: [movie] }],
      pageParams: [1],
    });

    await renderDetail(queryClient);

    expect(screen.getByText('Cached Movie')).toBeOnTheScreen();
    expect(screen.getByText('Trailer unavailable offline')).toBeOnTheScreen();
    expect(screen.queryByTestId('watch-trailer')).toBeNull();
  });
});
