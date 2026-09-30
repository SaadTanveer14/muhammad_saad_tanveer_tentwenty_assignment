import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Skeleton } from '../../../../core/ui';
import {
  colors,
  elevation,
  fontFamily,
  radii,
  spacing,
} from '../../../../core/theme';
import { SeatGrid } from '../../../seating/presentation/components/SeatGrid';
import { seatMetrics } from '../../../seating/presentation/components/seatMetrics';
import { useSeatLayout } from '../../../seating/presentation/hooks/useSeatLayout';
import type { Showtime } from '../../domain/types';

export const SHOWTIME_CARD_WIDTH = 249;
const CARD_HEIGHT = 145;
const PREVIEW_WIDTH = 150;
const NO_SELECTION: ReadonlySet<string> = new Set();

export interface ShowtimeCardProps {
  showtime: Showtime;
  selected: boolean;
  onPress: (showtime: Showtime) => void;
}

export const ShowtimeCard = memo(function ShowtimeCard({
  showtime,
  selected,
  onPress,
}: ShowtimeCardProps) {
  const { data: layout } = useSeatLayout(showtime.layoutId);
  const metrics = useMemo(
    () =>
      layout
        ? seatMetrics(layout, PREVIEW_WIDTH, { showRowLabels: false })
        : null,
    [layout],
  );
  const place = `${showtime.cinema} + ${showtime.hall}`;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${showtime.startTime}, ${place}, from ${showtime.prices.regular} dollars or ${showtime.bonusFrom} bonus points`}
      onPress={() => onPress(showtime)}
      style={styles.root}
      testID={`showtime-${showtime.startTime}`}
    >
      <View style={styles.meta}>
        <AppText variant="caption">{showtime.startTime}</AppText>
        <AppText
          variant="caption"
          color={colors.textSecondary}
          numberOfLines={1}
        >
          {place}
        </AppText>
      </View>
      <View style={[styles.card, selected && styles.selected]}>
        {layout && metrics ? (
          <SeatGrid
            layout={layout}
            metrics={metrics}
            selectedIds={NO_SELECTION}
            showRowLabels={false}
            showScreenLabel={false}
          />
        ) : (
          <Skeleton width={PREVIEW_WIDTH} height={90} />
        )}
      </View>
      <AppText variant="caption" color={colors.textMuted}>
        From{' '}
        <AppText variant="caption" style={styles.strong}>
          {showtime.prices.regular}$
        </AppText>
        {' or '}
        <AppText variant="caption" style={styles.strong}>
          {showtime.bonusFrom} bonus
        </AppText>
      </AppText>
    </Pressable>
  );
});

export function ShowtimeCardSkeleton() {
  return (
    <View style={styles.root}>
      <Skeleton width={140} height={14} />
      <Skeleton
        width={SHOWTIME_CARD_WIDTH}
        height={CARD_HEIGHT}
        radius={radii.lg}
      />
      <Skeleton width={160} height={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: SHOWTIME_CARD_WIDTH, gap: spacing.sm + spacing.xxs },
  meta: { flexDirection: 'row', gap: spacing.sm + spacing.xxs },
  card: {
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selected: { borderColor: colors.primary, ...elevation.card },
  strong: { fontFamily: fontFamily.semibold, color: colors.textPrimary },
});
