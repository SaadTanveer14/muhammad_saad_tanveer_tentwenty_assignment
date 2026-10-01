import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppImage,
  AppText,
  GradientOverlay,
  Skeleton,
} from '../../../../core/ui';
import { colors, radii, spacing } from '../../../../core/theme';
import type { Movie } from '../../domain/types';

/** 335×180 in the design; the aspect ratio is kept at every width. */
export const HERO_ASPECT_RATIO = 335 / 180;

export interface MovieHeroCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

export const MovieHeroCard = memo(function MovieHeroCard({
  movie,
  onPress,
}: MovieHeroCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={movie.title}
      accessibilityHint="Opens movie details"
      onPress={() => onPress(movie)}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
      testID={`movie-card-${movie.id}`}
    >
      <AppImage
        source={movie.backdrop ?? movie.poster}
        style={StyleSheet.absoluteFill}
      />
      <GradientOverlay
        stops={[
          { offset: 0.6, opacity: 0 },
          { offset: 1, opacity: 1 },
        ]}
      />
      <AppText
        variant="title"
        color={colors.textInverse}
        numberOfLines={2}
        style={styles.title}
      >
        {movie.title}
      </AppText>
    </Pressable>
  );
});

export function MovieHeroCardSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height="100%" radius={radii.lg} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    aspectRatio: HERO_ASPECT_RATIO,
    borderRadius: radii.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.skeleton,
  },
  pressed: { opacity: 0.9 },
  title: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  skeleton: { aspectRatio: HERO_ASPECT_RATIO },
});
