import { useWindowDimensions } from 'react-native';

import { spacing } from '../theme';
import { type SizeClass, sizeClassFor } from './breakpoints';

export interface ResponsiveLayout {
  width: number;
  height: number;
  sizeClass: SizeClass;
  isLandscape: boolean;
  /** Horizontal screen padding. */
  gutter: number;
}

export function computeLayout(width: number, height: number): ResponsiveLayout {
  return {
    width,
    height,
    sizeClass: sizeClassFor(width),
    isLandscape: width > height,
    gutter: spacing.xl,
  };
}

export function useResponsive(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  return computeLayout(width, height);
}

/**
 * How many columns of at least `minItemWidth` fit in `availableWidth`,
 * given a `gap` between them, clamped to `[1, maxColumns]`.
 */
export function columnsFor(
  availableWidth: number,
  minItemWidth: number,
  gap: number,
  maxColumns = Number.POSITIVE_INFINITY,
): number {
  const fit = Math.floor((availableWidth + gap) / (minItemWidth + gap));
  return Math.max(1, Math.min(maxColumns, fit));
}
