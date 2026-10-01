import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { Divider } from './Divider';

export function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.root} accessibilityRole="header">
      <AppText variant="caption">{label}</AppText>
      <Divider color={colors.border} style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: spacing.xl },
  divider: { marginTop: spacing.sm + spacing.xxs },
});
