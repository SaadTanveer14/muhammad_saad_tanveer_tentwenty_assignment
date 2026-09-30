import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, elevation, radii, spacing } from '../theme';
import { AppText } from './AppText';

export type ChipProps =
  | {
      variant: 'genre';
      label: string;
      /** Background from data; callers cycle `colors.genre` when absent. */
      color: string;
    }
  | {
      variant: 'selectable';
      label: string;
      selected: boolean;
      onPress: () => void;
      accessibilityLabel?: string;
      testID?: string;
    };

export function Chip(props: ChipProps) {
  if (props.variant === 'genre') {
    return (
      <View style={[styles.genre, { backgroundColor: props.color }]}>
        <AppText variant="chip" color={colors.textInverse}>
          {props.label}
        </AppText>
      </View>
    );
  }

  const { selected } = props;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityState={{ selected }}
      onPress={props.onPress}
      testID={props.testID}
      style={({ pressed }) => [
        styles.selectable,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      <AppText
        variant="chip"
        color={selected ? colors.textInverse : colors.textPrimary}
      >
        {props.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  genre: {
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm + spacing.xxs,
    borderRadius: radii.pill,
  },
  selectable: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
  },
  selected: { backgroundColor: colors.primary, ...elevation.glow },
  unselected: { backgroundColor: colors.surfaceMuted },
  pressed: { opacity: 0.8 },
});
