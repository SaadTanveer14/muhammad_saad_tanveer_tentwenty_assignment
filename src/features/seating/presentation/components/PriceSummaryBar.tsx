import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button } from '../../../../core/ui';
import { colors, radii, spacing } from '../../../../core/theme';

export interface PriceSummaryBarProps {
  total: number;
  onProceed: () => void;
  disabled: boolean;
}

export function PriceSummaryBar({
  total,
  onProceed,
  disabled,
}: PriceSummaryBarProps) {
  return (
    <View style={styles.root}>
      <View
        style={styles.total}
        accessible
        accessibilityLabel={`Total price ${total} dollars`}
      >
        <AppText variant="label">Total Price</AppText>
        <AppText variant="amount" testID="total-price">
          $ {total}
        </AppText>
      </View>
      <Button
        label="Proceed to pay"
        onPress={onProceed}
        disabled={disabled}
        style={styles.cta}
        testID="proceed-to-pay"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', gap: spacing.sm + spacing.xxs },
  total: {
    width: 108,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.chip,
  },
  cta: { flex: 1 },
});
