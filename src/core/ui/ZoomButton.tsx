import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, elevation, radii } from '../theme';
import { Icon } from './Icon';

export interface ZoomButtonProps {
  direction: 'in' | 'out';
  onPress: () => void;
  disabled?: boolean;
}

export function ZoomButton({ direction, onPress, disabled }: ZoomButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={direction === 'in' ? 'Zoom in' : 'Zoom out'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.root,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Icon name={direction === 'in' ? 'plus' : 'minus'} size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.control,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
