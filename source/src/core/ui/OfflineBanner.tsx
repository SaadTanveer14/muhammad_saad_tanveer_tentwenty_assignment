import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useIsOnline } from '../network';
import { colors, spacing } from '../theme';
import { AppText } from './AppText';

export interface OfflineBannerProps {
  message?: string;
}

/** Shown above cached content while the device is offline. */
export function OfflineBanner({
  message = 'Offline, showing saved results',
}: OfflineBannerProps) {
  const isOnline = useIsOnline();
  if (isOnline) {
    return null;
  }
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.root}
      testID="offline-banner"
    >
      <AppText variant="caption" color={colors.textInverse}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surfaceInverse,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
});
