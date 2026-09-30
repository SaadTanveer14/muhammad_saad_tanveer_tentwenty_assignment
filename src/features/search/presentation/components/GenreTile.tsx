import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppImage, AppText, Skeleton } from '../../../../core/ui';
import { colors, radii, spacing } from '../../../../core/theme';
import type { Category } from '../../domain/types';

/** 163×100 in the design; the aspect ratio is kept at every width. */
const TILE_ASPECT_RATIO = 1.625;

export const GenreTile = memo(function GenreTile({
  category,
  onPress,
}: {
  category: Category;
  onPress: (category: Category) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPress={() => onPress(category)}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
      testID={`genre-${category.id}`}
    >
      <AppImage source={category.image} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      <AppText
        variant="subtitle"
        color={colors.textInverse}
        style={styles.label}
      >
        {category.name}
      </AppText>
    </Pressable>
  );
});

export function GenreTileSkeleton() {
  return (
    <View style={{ aspectRatio: TILE_ASPECT_RATIO }}>
      <Skeleton height="100%" radius={radii.lg} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    aspectRatio: TILE_ASPECT_RATIO,
    borderRadius: radii.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  pressed: { opacity: 0.85 },
  scrim: { backgroundColor: colors.imageScrim },
  label: { marginLeft: spacing.sm + spacing.xxs, marginBottom: spacing.lg },
});
