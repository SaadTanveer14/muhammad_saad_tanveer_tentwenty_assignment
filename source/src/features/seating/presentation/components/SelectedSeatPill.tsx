import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '../../../../core/ui';
import { colors, fontFamily, radii, spacing } from '../../../../core/theme';
import type { Seat } from '../../domain/types';

/** "4 / 3 row ✕": seat number / row; ✕ deselects that seat. */
export function SelectedSeatPill({
  seat,
  onRemove,
}: {
  seat: Seat;
  onRemove: () => void;
}) {
  return (
    <View style={styles.root}>
      <AppText variant="body" style={styles.number}>
        {seat.number}
      </AppText>
      <AppText variant="body" color={colors.textSecondary}>
        /
      </AppText>
      <AppText variant="label">{seat.row} row</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove row ${seat.row}, seat ${seat.number}`}
        hitSlop={10}
        onPress={onRemove}
        style={styles.remove}
      >
        <Icon name="close" size={14} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.chip,
  },
  number: { fontFamily: fontFamily.medium },
  remove: { marginLeft: spacing.sm },
});
