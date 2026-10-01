import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export interface AppHeaderProps {
  title?: string;
  /** Second line in the brand colour (centred variant). */
  subtitle?: string;
  /** Centred title + subtitle (showtimes, seat map) vs left-aligned. */
  align?: 'left' | 'center';
  onBack?: () => void;
  backLabel?: string;
  /** Controls on the right, e.g. the search button. */
  trailing?: ReactNode;
  /** Overlays the content below (detail hero); white text, no fill. */
  transparent?: boolean;
  /** Replaces the title row entirely (e.g. the search field). */
  children?: ReactNode;
}

/**
 * White bar with a hairline divider that also paints the status-bar area,
 * as in every mockup. `transparent` floats over imagery instead.
 */
export function AppHeader({
  title,
  subtitle,
  align = 'left',
  onBack,
  backLabel = 'Back',
  trailing,
  transparent = false,
  children,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const tint = transparent ? colors.textInverse : colors.textPrimary;

  return (
    <View
      accessibilityRole="header"
      style={[
        styles.root,
        transparent ? styles.transparent : styles.solid,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left + spacing.xl,
          paddingRight: insets.right + spacing.xl,
        },
      ]}
    >
      {children ?? (
        <View style={styles.row}>
          {onBack ? (
            <IconButton
              icon="chevronLeft"
              accessibilityLabel={backLabel}
              onPress={onBack}
              color={tint}
              style={styles.back}
            />
          ) : null}
          <View
            style={[
              styles.titles,
              align === 'center' ? styles.centered : styles.leading,
            ]}
            pointerEvents="none"
          >
            {title ? (
              <AppText
                variant="subtitle"
                color={tint}
                numberOfLines={1}
                style={align === 'center' && styles.centerText}
              >
                {title}
              </AppText>
            ) : null}
            {subtitle ? (
              <AppText
                variant="caption"
                color={colors.primary}
                numberOfLines={1}
                style={[
                  styles.subtitle,
                  align === 'center' && styles.centerText,
                ]}
              >
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
        </View>
      )}
    </View>
  );
}

const ROW_HEIGHT = 63;

const styles = StyleSheet.create({
  root: { paddingBottom: spacing.md },
  solid: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  transparent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  row: {
    minHeight: ROW_HEIGHT - spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: { marginLeft: -spacing.md, marginRight: spacing.xxs },
  titles: { flex: 1 },
  leading: {},
  centered: {
    ...StyleSheet.absoluteFill,
    marginHorizontal: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: { textAlign: 'center' },
  subtitle: { marginTop: spacing.xs },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -spacing.md,
  },
});
