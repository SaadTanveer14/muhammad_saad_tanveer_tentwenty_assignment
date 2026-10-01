import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
} from 'react-native-gesture-handler';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii, spacing } from '../../../../core/theme';
import { ZoomButton } from '../../../../core/ui';
import type { Seat, SeatLayout } from '../../domain/types';
import { SeatGrid } from './SeatGrid';
import { seatMetrics } from './seatMetrics';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export interface SeatMapProps {
  layout: SeatLayout;
  selectedIds: ReadonlySet<string>;
  onSeatPress: (seat: Seat) => void;
}

interface Bounds {
  viewportWidth: number;
  viewportHeight: number;
  contentHeight: number;
}

/** Keeps the scaled room inside the viewport (content is centred at scale 1). */
function clampTranslation(
  scale: number,
  tx: number,
  ty: number,
  b: Bounds,
): { x: number; y: number } {
  'worklet';
  const maxX = Math.max(0, (b.viewportWidth * scale - b.viewportWidth) / 2);
  const maxY = Math.max(0, (b.contentHeight * scale - b.viewportHeight) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, tx)),
    y: Math.min(maxY, Math.max(-maxY, ty)),
  };
}

/**
 * Interactive seat map: fits the room to the available width, then supports
 * pinch-to-zoom and panning on the UI thread. The +/− buttons step through
 * the same zoom range; the bar underneath shows the horizontal position.
 */
export function SeatMap({ layout, selectedIds, onSeatPress }: SeatMapProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  const metrics = useMemo(
    () => (size.width > 0 ? seatMetrics(layout, size.width) : null),
    [layout, size.width],
  );

  const bounds = useSharedValue<Bounds>({
    viewportWidth: 0,
    viewportHeight: 0,
    contentHeight: 0,
  });
  useEffect(() => {
    bounds.value = {
      viewportWidth: size.width,
      viewportHeight: size.height,
      contentHeight: metrics?.height ?? 0,
    };
  }, [bounds, size, metrics]);

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const start = useSharedValue({ scale: 1, x: 0, y: 0 });

  const pinch = usePinchGesture({
    onBegin: () => {
      'worklet';
      start.value = { scale: scale.value, x: tx.value, y: ty.value };
    },
    onUpdate: e => {
      'worklet';
      scale.value = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, start.value.scale * e.scale),
      );
      const t = clampTranslation(scale.value, tx.value, ty.value, bounds.value);
      tx.value = t.x;
      ty.value = t.y;
    },
  });

  const pan = usePanGesture({
    minDistance: 6,
    onBegin: () => {
      'worklet';
      start.value = { scale: scale.value, x: tx.value, y: ty.value };
    },
    onUpdate: e => {
      'worklet';
      const t = clampTranslation(
        scale.value,
        start.value.x + e.translationX,
        start.value.y + e.translationY,
        bounds.value,
      );
      tx.value = t.x;
      ty.value = t.y;
    },
  });

  const gesture = useSimultaneousGestures(pinch, pan);

  const zoomBy = useCallback(
    (delta: number) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale.value + delta));
      const t = clampTranslation(next, tx.value, ty.value, bounds.value);
      scale.value = withTiming(next);
      tx.value = withTiming(t.x);
      ty.value = withTiming(t.y);
    },
    [bounds, scale, tx, ty],
  );

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.root}>
      <View style={styles.viewport} onLayout={onLayout}>
        <GestureDetector gesture={gesture}>
          <View style={styles.gestureArea}>
            {metrics ? (
              <Animated.View
                style={[
                  styles.content,
                  { height: metrics.height },
                  contentStyle,
                ]}
              >
                <SeatGrid
                  layout={layout}
                  metrics={metrics}
                  selectedIds={selectedIds}
                  onSeatPress={onSeatPress}
                />
              </Animated.View>
            ) : null}
          </View>
        </GestureDetector>
        <View style={styles.zoomControls}>
          <ZoomButton direction="in" onPress={() => zoomBy(ZOOM_STEP)} />
          <ZoomButton direction="out" onPress={() => zoomBy(-ZOOM_STEP)} />
        </View>
      </View>
      <ScrollIndicator scale={scale} tx={tx} viewportWidth={size.width} />
    </View>
  );
}

function ScrollIndicator({
  scale,
  tx,
  viewportWidth,
}: {
  scale: SharedValue<number>;
  tx: SharedValue<number>;
  viewportWidth: number;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const thumbStyle = useAnimatedStyle(() => {
    const thumb = trackWidth / scale.value;
    const maxX = (viewportWidth * scale.value - viewportWidth) / 2;
    const progress = maxX > 0 ? (maxX - tx.value) / (2 * maxX) : 0;
    return {
      width: thumb,
      transform: [{ translateX: progress * (trackWidth - thumb) }],
    };
  });

  return (
    <View
      style={styles.track}
      onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  viewport: { flex: 1, overflow: 'hidden' },
  gestureArea: { flex: 1, justifyContent: 'center' },
  content: { width: '100%' },
  zoomControls: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  track: {
    height: 5,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  thumb: {
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.scrollbar,
  },
});
