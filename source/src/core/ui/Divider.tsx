import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../theme';

export function Divider({
  color = colors.divider,
  style,
}: {
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.line, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth * 2, alignSelf: 'stretch' },
});
