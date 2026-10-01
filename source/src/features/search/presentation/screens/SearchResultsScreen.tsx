import React, { useCallback } from 'react';

import type { WatchStackScreenProps } from '../../../../app/navigation/types';
import { useIsOnline } from '../../../../core/network';
import {
  AppHeader,
  OfflineBanner,
  ScreenScaffold,
  StateView,
} from '../../../../core/ui';
import type { Movie } from '../../../movies/domain/types';
import {
  MovieResultsList,
  MovieResultsSkeleton,
} from '../components/MovieResultsList';
import { useSearchResults } from '../hooks';

export function SearchResultsScreen({
  navigation,
  route,
}: WatchStackScreenProps<'SearchResults'>) {
  const params = route.params;
  const {
    movies,
    totalResults,
    isPending,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSearchResults(params);
  const isOnline = useIsOnline();
  const subject = 'genreId' in params ? params.genreName : `“${params.query}”`;

  const openMovie = useCallback(
    (movie: Movie) => navigation.navigate('MovieDetail', { movieId: movie.id }),
    [navigation],
  );

  const count = totalResults;
  const title = isPending
    ? isOnline
      ? 'Searching…'
      : 'Results'
    : `${count} ${count === 1 ? 'Result' : 'Results'} Found`;

  let body: React.ReactNode;
  if (isPending && !isOnline) {
    // Offline with nothing cached: the query is paused, not failed, so say
    // so instead of showing skeletons indefinitely. It resumes on reconnect.
    body = (
      <StateView
        state="offline"
        message="Connect to the internet to see these results."
        onRetry={refetch}
      />
    );
  } else if (isPending) {
    body = <MovieResultsSkeleton />;
  } else if (isError) {
    body = <StateView state="error" onRetry={refetch} />;
  } else if (count === 0) {
    body = (
      <StateView
        state="empty"
        title={`No results for ${subject}`}
        message="Try a different search or browse another genre."
      />
    );
  } else {
    body = (
      <MovieResultsList
        movies={movies}
        onOpen={openMovie}
        onEndReached={() =>
          hasNextPage && !isFetchingNextPage && fetchNextPage()
        }
      />
    );
  }

  return (
    <ScreenScaffold
      header={<AppHeader title={title} onBack={navigation.goBack} />}
      testID="search-results-screen"
    >
      <OfflineBanner />
      {body}
    </ScreenScaffold>
  );
}
