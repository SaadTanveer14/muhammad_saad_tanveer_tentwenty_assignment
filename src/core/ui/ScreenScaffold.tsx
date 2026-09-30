import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';

export interface ScreenScaffoldProps {
  header?: ReactNode;
  children: ReactNode;
  /** Sticky bottom area (CTAs); pads itself for the home indicator. */
  footer?: ReactNode;
  backgroundColor?: string;
  testID?: string;
}

/**
 * Page shell shared by every screen: header, body, optional sticky footer.
 * The body respects left/right safe areas (landscape notch); the tab bar,
 * when present, is drawn by the navigator.
 */
export function ScreenScaffold({
  header,
  children,
  footer,
  backgroundColor = colors.background,
  testID,
}: ScreenScaffoldProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor }]} testID={testID}>
      {header}
      <View
        style={[
          styles.body,
          { paddingLeft: insets.left, paddingRight: insets.right },
        ]}
      >
        {children}
      </View>
      {footer ? (
        <View
          style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});
