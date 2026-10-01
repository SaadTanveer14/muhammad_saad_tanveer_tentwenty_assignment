import React, { useCallback, useId, useState } from 'react';
import {
  type LayoutChangeEvent,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '../theme';

export interface GradientStop {
  /** 0 = top, 1 = bottom. */
  offset: number;
  opacity: number;
}

export interface GradientOverlayProps {
  stops: GradientStop[];
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Vertical scrim over imagery so text on top stays readable.
 *
 * The SVG is drawn at its measured pixel size rather than "100%": on
 * Android, react-native-svg doesn't redraw percentage sizes when the view
 * is resized (e.g. after rotating), which left the scrim covering only
 * part of the card.
 */
export function GradientOverlay({
  stops,
  color = colors.gradientEnd,
  style,
}: GradientOverlayProps) {
  const id = useId().replace(/:/g, '');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize(prev =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  return (
    <View
      style={[StyleSheet.absoluteFill, style]}
      onLayout={onLayout}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {size.width > 0 && size.height > 0 ? (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              {stops.map(stop => (
                <Stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </LinearGradient>
          </Defs>
          <Rect width={size.width} height={size.height} fill={`url(#${id})`} />
        </Svg>
      ) : null}
    </View>
  );
}
