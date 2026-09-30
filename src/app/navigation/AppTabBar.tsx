import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, type IconName } from '../../core/ui';
import { colors, fontFamily, radii, spacing } from '../../core/theme';
import type { TabParamList } from './types';

const TABS: Record<keyof TabParamList, { label: string; icon: IconName }> = {
  Dashboard: { label: 'Dashboard', icon: 'dashboard' },
  Watch: { label: 'Watch', icon: 'watch' },
  MediaLibrary: { label: 'Media Library', icon: 'library' },
  More: { label: 'More', icon: 'list' },
};

export const RAIL_WIDTH = 96;

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

/**
 * The dark tab bar from the design. On expanded widths the navigator puts it
 * on the left and it becomes a vertical rail.
 */
export function AppTabBar({
  state,
  navigation,
  rail = false,
}: BottomTabBarProps & { rail?: boolean }) {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();

  // Android resizes the window for the keyboard; keep the bar out of the way.
  if (keyboardVisible && Platform.OS === 'android' && !rail) {
    return null;
  }

  return (
    <View
      accessibilityRole="tablist"
      style={
        rail
          ? [
              styles.rail,
              {
                paddingTop: insets.top + spacing.xxxl,
                paddingLeft: insets.left,
              },
            ]
          : [
              styles.bar,
              {
                paddingBottom: Math.max(insets.bottom - spacing.lg, spacing.md),
                paddingLeft: insets.left,
                paddingRight: insets.right,
              },
            ]
      }
    >
      {state.routes.map((route, index) => {
        const tab = TABS[route.name as keyof TabParamList];
        const focused = state.index === index;
        const tint = focused ? colors.textInverse : colors.textSecondary;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={rail ? styles.railItem : styles.item}
            testID={`tab-${route.name}`}
          >
            <Icon name={tab.icon} size={20} color={tint} />
            <AppText
              variant="label"
              color={tint}
              numberOfLines={1}
              style={focused && styles.activeLabel}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: spacing.lg + spacing.xxs,
    backgroundColor: colors.surfaceInverse,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  rail: {
    width: RAIL_WIDTH,
    gap: spacing.xxl,
    backgroundColor: colors.surfaceInverse,
    borderTopRightRadius: radii.sheet,
    borderBottomRightRadius: radii.sheet,
  },
  railItem: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    minHeight: 56,
  },
  activeLabel: { fontFamily: fontFamily.semibold },
});
