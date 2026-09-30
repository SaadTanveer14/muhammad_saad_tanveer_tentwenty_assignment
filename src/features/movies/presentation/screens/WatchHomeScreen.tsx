import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import type { WatchStackScreenProps } from '../../../../app/navigation/types';
import { isApiError } from '../../../../core/api';
import { columnsFor, useLayoutWidth } from '../../../../core/layout';
import { useIsOnline } from '../../../../core/network';
import { colors, spacing } from '../../../../core/theme';
import {
  AppHeader,
  AppText,
  Button,
  IconButton,
  OfflineBanner,
  ScreenScaffold,
  StateView,
} from '../../../../core/ui';
import type { Movie } from '../../domain/types';
import {
  MovieHeroCard,
  MovieHeroCardSkeleton,
} from '../components/MovieHeroCard';
import { useUpcomingMovies } from '../hooks';

const GAP = spacing.xl;
const MIN_CARD_WIDTH = 320;

export function WatchHomeScreen({
  navigation,
}: WatchStackScreenProps<'WatchHome'>) {
  const isOnline = useIsOnline();
  const [width, onLayout] = useLayoutWidth();
  const columns = columnsFor(width - GAP * 2, MIN_CARD_WIDTH, GAP);
  const {
    movies,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useUpcomingMovies();

  const openMovie = useCallback(
    (movie: Movie) => navigation.navigate('MovieDetail', { movieId: movie.id }),
    [navigation],
  );

  const header = (
    <AppHeader
      title="Watch"
      trailing={
        <IconButton
          icon="search"
          accessibilityLabel="Search"
          onPress={() => navigation.navigate('Search')}
          testID="open-search"
        />
      }
    />
  );

  let body: React.ReactNode;
  if (movies.length > 0) {
    body = (
      <FlashList
        key={columns}
        data={movies}
        numColumns={columns}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <MovieHeroCard movie={item} onPress={openMovie} />
          </View>
        )}
        contentContainerStyle={styles.list}
        onEndReached={() =>
          hasNextPage && !isFetchingNextPage && fetchNextPage()
        }
        onEndReachedThreshold={0.8}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={
          <ListFooter
            loading={isFetchingNextPage}
            failed={isFetchNextPageError}
            onRetry={() => fetchNextPage()}
          />
        }
      />
    );
  } else if (isPending && isOnline) {
    body = (
      <View style={styles.list} testID="movie-list-loading">
        {[0, 1, 2].map(i => (
          <View key={i} style={styles.cell}>
            <MovieHeroCardSkeleton />
          </View>
        ))}
      </View>
    );
  } else if (!isOnline) {
    body = <StateView state="offline" onRetry={refetch} />;
  } else if (isError) {
    body = (
      <StateView
        state="error"
        message={
          isApiError(error) && error.kind === 'network'
            ? 'We couldn’t reach the server.'
            : undefined
        }
        onRetry={refetch}
      />
    );
  } else {
    body = (
      <StateView
        state="empty"
        title="No upcoming movies"
        message="Check back soon for new releases."
      />
    );
  }

  return (
    <ScreenScaffold header={header} testID="watch-home-screen">
      <OfflineBanner />
      <View style={styles.body} onLayout={onLayout}>
        {body}
      </View>
    </ScreenScaffold>
  );
}

function ListFooter({
  loading,
  failed,
  onRetry,
}: {
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) {
  if (loading) {
    return <ActivityIndicator color={colors.primary} style={styles.footer} />;
  }
  if (failed) {
    return (
      <View style={styles.footer}>
        <AppText variant="caption" color={colors.textSecondary}>
          Couldn’t load more movies.
        </AppText>
        <Button label="Retry" variant="outline" onPress={onRetry} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  list: {
    paddingHorizontal: GAP / 2,
    paddingTop: spacing.xxxl - GAP / 2 + spacing.xs,
    paddingBottom: spacing.xl,
  },
  cell: { paddingHorizontal: GAP / 2, paddingVertical: GAP / 2 },
  footer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
});
