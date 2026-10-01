import { FlashList } from '@shopify/flash-list';
import React, { type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLayoutWidth } from '../../../../core/layout';
import { spacing } from '../../../../core/theme';
import {
  MediaListItem,
  MediaListItemSkeleton,
} from '../../../movies/presentation/components/MediaListItem';
import type { Movie } from '../../../movies/domain/types';
import { useGenreNames } from '../../../movies/presentation/hooks';

const GAP = spacing.xl;
/** Two columns once each row can keep its fixed thumbnail plus a title. */
const TWO_COLUMN_MIN_WIDTH = 600;

export interface MovieResultsListProps {
  movies: Movie[];
  onOpen: (movie: Movie) => void;
  header?: ReactElement;
  /** Load the next page; the list asks early so scrolling stays smooth. */
  onEndReached?: () => void;
}

/** Result rows (screens 03 and 04); two columns on wide layouts. */
export function MovieResultsList({
  movies,
  onOpen,
  header,
  onEndReached,
}: MovieResultsListProps) {
  const [width, onLayout] = useLayoutWidth();
  const columns = width >= TWO_COLUMN_MIN_WIDTH ? 2 : 1;
  const genreNames = useGenreNames();

  return (
    <View style={styles.root} onLayout={onLayout}>
      <FlashList
        key={columns}
        data={movies}
        numColumns={columns}
        keyExtractor={item => String(item.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={header}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.8}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <MediaListItem
              movie={item}
              genre={genreNames(item.genreIds)[0]}
              onPress={onOpen}
              onMorePress={onOpen}
            />
          </View>
        )}
      />
    </View>
  );
}

export function MovieResultsSkeleton() {
  return (
    <View style={[styles.list, styles.skeleton]} testID="results-loading">
      {[0, 1, 2].map(i => (
        <MediaListItemSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: {
    paddingHorizontal: GAP / 2,
    paddingTop: spacing.xxxl - GAP / 2,
    paddingBottom: spacing.xl,
  },
  cell: { paddingHorizontal: GAP / 2, paddingVertical: GAP / 2 },
  skeleton: { paddingHorizontal: GAP, gap: GAP },
});
