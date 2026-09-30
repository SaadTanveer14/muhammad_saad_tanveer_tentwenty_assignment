import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '../../../../core/ui';
import { colors } from '../../../../core/theme';

export interface ScreenCurveProps {
  width: number;
  height: number;
  label?: string;
}

/** The curved "SCREEN" line above the seats. */
export function ScreenCurve({ width, height, label }: ScreenCurveProps) {
  const inset = width * 0.06;
  const top = height * 0.2;
  const bottom = height * 0.55;
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} pointerEvents="none">
        <Path
          d={`M ${inset} ${bottom} Q ${width / 2} ${top - (bottom - top)} ${
            width - inset
          } ${bottom}`}
          stroke={colors.primary}
          strokeWidth={1}
          fill="none"
        />
      </Svg>
      {label ? (
        <View
          style={[StyleSheet.absoluteFill, styles.labelWrap, { top: top + 4 }]}
        >
          <AppText variant="micro" color={colors.textSecondary}>
            {label}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labelWrap: { alignItems: 'center' },
});
