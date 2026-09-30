import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../core/ui';
import { colors } from '../../../../core/theme';
import type { Seat, SeatLayout } from '../../domain/types';
import { ScreenCurve } from './ScreenCurve';
import { seatAccessibilityLabel, seatColor } from './seatColor';
import type { SeatMetrics } from './seatMetrics';
import { SeatGlyph } from './SeatGlyph';

export interface SeatGridProps {
  layout: SeatLayout;
  metrics: SeatMetrics;
  selectedIds: ReadonlySet<string>;
  /** Omit for a read-only preview (plain views, no touch targets). */
  onSeatPress?: (seat: Seat) => void;
  showRowLabels?: boolean;
  showScreenLabel?: boolean;
}

/**
 * Renders a seat layout at a given size. Used both for the tiny preview on
 * showtime cards and, inside `SeatMap`, for the interactive room.
 */
export const SeatGrid = memo(function SeatGrid({
  layout,
  metrics,
  selectedIds,
  onSeatPress,
  showRowLabels = true,
  showScreenLabel = true,
}: SeatGridProps) {
  const { pitch, rowPitch, seatWidth, labelWidth, aisleWidth } = metrics;
  const hitSlop = {
    top: (rowPitch - seatWidth) / 2,
    bottom: (rowPitch - seatWidth) / 2,
    left: (pitch - seatWidth) / 2,
    right: (pitch - seatWidth) / 2,
  };

  return (
    <View style={{ width: metrics.width, height: metrics.height }}>
      <ScreenCurve
        width={metrics.width}
        height={metrics.screenHeight}
        label={showScreenLabel ? layout.screenLabel : undefined}
      />
      {layout.rowLabels.map((label, rowIndex) => (
        <View key={label} style={[styles.row, { height: rowPitch }]}>
          <View style={{ width: labelWidth }}>
            {showRowLabels ? (
              <AppText variant="micro" color={colors.textPrimary}>
                {label}
              </AppText>
            ) : null}
          </View>
          {layout.sections.map((section, sectionIndex) => (
            <View
              key={section.id}
              style={[
                styles.section,
                sectionIndex > 0 && { marginLeft: aisleWidth },
              ]}
            >
              {section.rows[rowIndex].seats.map((seat, col) => (
                <View
                  key={seat?.id ?? `${section.id}-${rowIndex}-${col}`}
                  style={[styles.cell, { width: pitch }]}
                >
                  {seat ? (
                    <SeatCell
                      seat={seat}
                      selected={selectedIds.has(seat.id)}
                      width={seatWidth}
                      hitSlop={hitSlop}
                      onPress={onSeatPress}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

interface SeatCellProps {
  seat: Seat;
  selected: boolean;
  width: number;
  hitSlop: { top: number; bottom: number; left: number; right: number };
  onPress?: (seat: Seat) => void;
}

const SeatCell = memo(function SeatCell({
  seat,
  selected,
  width,
  hitSlop,
  onPress,
}: SeatCellProps) {
  const glyph = <SeatGlyph width={width} color={seatColor(seat, selected)} />;
  if (!onPress) {
    return glyph;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={seatAccessibilityLabel(seat, selected)}
      accessibilityState={{
        selected,
        disabled: seat.status === 'taken',
      }}
      hitSlop={hitSlop}
      onPress={() => onPress(seat)}
      testID={`seat-${seat.id}`}
    >
      {glyph}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  section: { flexDirection: 'row' },
  cell: { alignItems: 'center' },
});
