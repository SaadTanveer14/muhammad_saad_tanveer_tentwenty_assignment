import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppImage, AppText, IconButton, Skeleton } from '../../../../core/ui';
import { colors, radii, spacing } from '../../../../core/theme';
import type { Movie } from '../../domain/types';

export interface MediaListItemProps {
  movie: Movie;
  /** First genre name, shown under the title. */
  genre?: string;
  onPress: (movie: Movie) => void;
  onMorePress?: (movie: Movie) => void;
}

/** Search result row: 130×100 thumbnail, title, genre, "more" button. */
export const MediaListItem = memo(function MediaListItem({
  movie,
  genre,
  onPress,
  onMorePress,
}: MediaListItemProps) {
  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={genre ? `${movie.title}, ${genre}` : movie.title}
        onPress={() => onPress(movie)}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
        testID={`result-${movie.id}`}
      >
        <AppImage
          source={movie.backdrop ?? movie.poster}
          style={styles.thumb}
        />
        <View style={styles.text}>
          <AppText variant="subtitle" numberOfLines={2}>
            {movie.title}
          </AppText>
          {genre ? (
            <AppText
              variant="caption"
              color={colors.textDisabled}
              style={styles.genre}
            >
              {genre}
            </AppText>
          ) : null}
        </View>
      </Pressable>
      {onMorePress ? (
        <IconButton
          icon="more"
          size={20}
          color={colors.primary}
          accessibilityLabel={`More options for ${movie.title}`}
          onPress={() => onMorePress(movie)}
        />
      ) : null}
    </View>
  );
});

export function MediaListItemSkeleton() {
  return (
    <View style={styles.root}>
      <Skeleton width={THUMB_WIDTH} height={THUMB_HEIGHT} radius={radii.lg} />
      <View style={[styles.text, styles.skeletonText]}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="35%" height={12} />
      </View>
    </View>
  );
}

const THUMB_WIDTH = 130;
const THUMB_HEIGHT = 100;

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center' },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  pressed: { opacity: 0.7 },
  thumb: { width: THUMB_WIDTH, height: THUMB_HEIGHT, borderRadius: radii.lg },
  text: { flex: 1, marginLeft: spacing.xl },
  genre: { marginTop: spacing.sm },
  skeletonText: { gap: spacing.sm },
});
