import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../core/ui';
import { colors, spacing } from '../../../../core/theme';
import type { SeatPrices } from '../../domain/types';
import { SeatGlyph } from './SeatGlyph';

export function SeatLegend({ prices }: { prices: SeatPrices }) {
  const items = [
    { color: colors.seat.selected, label: 'Selected' },
    { color: colors.seat.taken, label: 'Not available' },
    { color: colors.seat.vip, label: `VIP (${prices.vip}$)` },
    { color: colors.seat.available, label: `Regular (${prices.regular} $)` },
  ];
  return (
    <View style={styles.grid}>
      {items.map(item => (
        <View key={item.label} style={styles.item}>
          <SeatGlyph width={17} color={item.color} />
          <AppText variant="caption" color={colors.textMuted}>
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  item: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
});
