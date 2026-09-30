import React, { useCallback } from 'react';

import type { WatchStackScreenProps } from '../../../../app/navigation/types';
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
  const { data, isPending, isError, refetch } = useSearchResults(params);
  const subject = 'genreId' in params ? params.genreName : `“${params.query}”`;

  const openMovie = useCallback(
    (movie: Movie) => navigation.navigate('MovieDetail', { movieId: movie.id }),
    [navigation],
  );

  const count = data?.totalResults ?? 0;
  const title = isPending
    ? 'Searching…'
    : `${count} ${count === 1 ? 'Result' : 'Results'} Found`;

  let body: React.ReactNode;
  if (isPending) {
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
    body = <MovieResultsList movies={data.results} onOpen={openMovie} />;
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
