import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import type { WatchStackScreenProps } from '../../../../app/navigation/types';
import { colors, spacing } from '../../../../core/theme';
import {
  AppHeader,
  AppText,
  OfflineBanner,
  ResponsiveGrid,
  ScreenScaffold,
  SearchField,
  SectionHeader,
  StateView,
} from '../../../../core/ui';
import type { Movie } from '../../../movies/domain/types';
import type { Category } from '../../domain/types';
import { GenreTile, GenreTileSkeleton } from '../components/GenreTile';
import {
  MovieResultsList,
  MovieResultsSkeleton,
} from '../components/MovieResultsList';
import { useCategories, useMovieSearch } from '../hooks';

export function SearchScreen({ navigation }: WatchStackScreenProps<'Search'>) {
  const [input, setInput] = useState('');
  const search = useMovieSearch(input);

  const openMovie = useCallback(
    (movie: Movie) => navigation.navigate('MovieDetail', { movieId: movie.id }),
    [navigation],
  );
  const openCategory = useCallback(
    (category: Category) =>
      navigation.navigate('SearchResults', {
        genreId: category.genreId,
        genreName: category.name,
      }),
    [navigation],
  );
  const submit = () => {
    if (search.term) {
      navigation.navigate('SearchResults', { query: search.term });
    }
  };

  const header = (
    <AppHeader>
      <View style={styles.field}>
        <SearchField
          value={input}
          onChangeText={setInput}
          returnKeyType="go"
          onSubmitEditing={submit}
          testID="search-input"
        />
      </View>
    </AppHeader>
  );

  return (
    <ScreenScaffold header={header} testID="search-screen">
      <OfflineBanner message="Offline, searching saved movies" />
      {search.term ? (
        <LiveResults search={search} onOpen={openMovie} />
      ) : (
        <CategoryGrid onOpen={openCategory} />
      )}
    </ScreenScaffold>
  );
}

function LiveResults({
  search,
  onOpen,
}: {
  search: ReturnType<typeof useMovieSearch>;
  onOpen: (movie: Movie) => void;
}) {
  if (search.isError) {
    return <StateView state="error" onRetry={search.retry} />;
  }
  if (!search.results) {
    return <MovieResultsSkeleton />;
  }
  if (search.results.length === 0) {
    return (
      <StateView
        state="empty"
        title={`No results for “${search.term}”`}
        message="Check the spelling or try another title."
      />
    );
  }
  return (
    <MovieResultsList
      movies={search.results}
      onOpen={onOpen}
      header={
        <View style={styles.sectionHeader}>
          <SectionHeader label="Top Results" />
          {search.isSearching ? (
            <View style={styles.searching} accessibilityLiveRegion="polite">
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="caption" color={colors.textSecondary}>
                Searching…
              </AppText>
            </View>
          ) : null}
        </View>
      }
    />
  );
}

function CategoryGrid({ onOpen }: { onOpen: (category: Category) => void }) {
  const { data, isPending, isError, refetch } = useCategories();
  if (isError) {
    return <StateView state="error" onRetry={refetch} />;
  }
  return (
    <ScrollView
      contentContainerStyle={styles.grid}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <ResponsiveGrid
        minItemWidth={150}
        gap={spacing.sm + spacing.xxs}
        minColumns={2}
        maxColumns={5}
      >
        {isPending
          ? Array.from({ length: 6 }, (_, i) => <GenreTileSkeleton key={i} />)
          : data?.map(category => (
              <GenreTile
                key={category.id}
                category={category}
                onPress={onOpen}
              />
            ))}
      </ResponsiveGrid>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  field: { paddingTop: spacing.sm, paddingBottom: spacing.lg },
  grid: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl - spacing.xs,
    paddingBottom: spacing.xl,
  },
  sectionHeader: { paddingHorizontal: spacing.sm + spacing.xxs },
  searching: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
});
