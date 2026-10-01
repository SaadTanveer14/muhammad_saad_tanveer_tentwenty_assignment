import React, { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { columnsFor, useLayoutWidth } from '../layout';

export interface ResponsiveGridProps {
  children: ReactNode;
  /** Columns are added while each cell stays at least this wide. */
  minItemWidth: number;
  gap: number;
  minColumns?: number;
  maxColumns?: number;
}

/** Non-virtualised grid for short collections (e.g. genre tiles). */
export function ResponsiveGrid({
  children,
  minItemWidth,
  gap,
  minColumns = 1,
  maxColumns,
}: ResponsiveGridProps) {
  const [width, onLayout] = useLayoutWidth();
  const columns = Math.max(
    minColumns,
    columnsFor(width, minItemWidth, gap, maxColumns),
  );
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  return (
    <View onLayout={onLayout} style={{ gap }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap }]}>
          {row.map((item, i) => (
            <View key={i} style={styles.cell}>
              {item}
            </View>
          ))}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <View key={`filler-${i}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { flex: 1 },
});
