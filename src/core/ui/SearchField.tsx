import React, { forwardRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors, radii, spacing, typography } from '../theme';
import { Icon } from './Icon';

export interface SearchFieldProps
  extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  /** Called by the clear (×) button, after the text is emptied. */
  onClear?: () => void;
}

/** Pill search input; the clear button only appears once there is text. */
export const SearchField = forwardRef<TextInput, SearchFieldProps>(
  function SearchField(
    {
      value,
      onChangeText,
      onClear,
      placeholder = 'TV shows, movies and more',
      ...rest
    },
    ref,
  ) {
    return (
      <View style={styles.root}>
        <Icon name="search" size={20} />
        <TextInput
          ref={ref}
          {...rest}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
          accessibilityLabel={rest.accessibilityLabel ?? 'Search'}
          style={styles.input}
        />
        {value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={12}
            onPress={() => {
              onChangeText('');
              onClear?.();
            }}
          >
            <Icon name="close" size={22} />
          </Pressable>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surfaceMuted,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
});
