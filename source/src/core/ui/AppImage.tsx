import FastImage, { type ResizeMode } from '@d11/react-native-fast-image';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../theme';
import type { ImageSource } from '../types';

export interface AppImageProps {
  source: ImageSource | null | undefined;
  style?: StyleProp<ViewStyle>;
  resizeMode?: ResizeMode;
  testID?: string;
}

/**
 * Disk-cached image (so posters survive offline) with a neutral placeholder
 * behind it while loading or when there is no image at all.
 */
export function AppImage({
  source,
  style,
  resizeMode = 'cover',
  testID,
}: AppImageProps) {
  return (
    <View style={[styles.placeholder, style]} testID={testID}>
      {source != null ? (
        <FastImage
          source={source}
          resizeMode={resizeMode}
          style={StyleSheet.absoluteFill}
          accessibilityIgnoresInvertColors
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: colors.skeleton, overflow: 'hidden' },
});
