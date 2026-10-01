import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'outline';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** Optional glyph before the label (e.g. play on "Watch Trailer"). */
  leadingIcon?: IconName;
  /** Overrides the label colour, e.g. white on an outline over imagery. */
  labelColor?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  leadingIcon,
  labelColor,
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityHint,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const textColor =
    labelColor ?? (variant === 'primary' ? colors.textInverse : colors.primary);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {leadingIcon ? (
            <Icon name={leadingIcon} size={16} color={textColor} />
          ) : null}
          <AppText variant="button" color={textColor}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
