import React, { useId } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
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

/** Vertical scrim over imagery so text on top stays readable. */
export function GradientOverlay({
  stops,
  color = colors.gradientEnd,
  style,
}: GradientOverlayProps) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
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
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
