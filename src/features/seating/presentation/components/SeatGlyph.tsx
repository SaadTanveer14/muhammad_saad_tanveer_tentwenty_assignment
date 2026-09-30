import React from 'react';
import { StyleSheet, View } from 'react-native';

/** A seat: rounded cushion with an armrest bar underneath, as in the design. */
export function SeatGlyph({ width, color }: { width: number; color: string }) {
  const bodyHeight = width * 0.7;
  const barHeight = Math.max(1, width * 0.14);
  return (
    <View style={{ width, alignItems: 'center' }}>
      <View
        style={{
          width,
          height: bodyHeight,
          borderRadius: width * 0.22,
          backgroundColor: color,
        }}
      />
      <View
        style={[
          styles.bar,
          {
            width: width * 0.8,
            height: barHeight,
            marginTop: barHeight * 0.6,
            borderRadius: barHeight,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {},
});
