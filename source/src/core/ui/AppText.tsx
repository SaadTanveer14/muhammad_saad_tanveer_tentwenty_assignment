import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '../theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

export function AppText({
  variant = 'body',
  color = colors.textPrimary,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[styles.base, typography[variant], { color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
