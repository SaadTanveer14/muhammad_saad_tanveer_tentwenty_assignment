import type { SeatLayout } from '../../domain/types';

/** Aisle width, in seat pitches. */
const AISLE = 1.5;

export interface SeatMetrics {
  /** Horizontal distance between seat centres. */
  pitch: number;
  rowPitch: number;
  seatWidth: number;
  labelWidth: number;
  aisleWidth: number;
  /** Height of the curved screen band above the rows. */
  screenHeight: number;
  width: number;
  height: number;
}

/**
 * Seat size is derived from the width available, so the whole room fits in
 * portrait and landscape alike; zoom takes it from there.
 */
export function seatMetrics(
  layout: SeatLayout,
  availableWidth: number,
  { showRowLabels = true }: { showRowLabels?: boolean } = {},
): SeatMetrics {
  const columns = layout.sections.reduce(
    (sum, s) => sum + (s.rows[0]?.seats.length ?? 0),
    0,
  );
  const aisles = Math.max(0, layout.sections.length - 1);
  // Row labels on the left, mirrored by equal padding on the right.
  const edgeUnits = showRowLabels ? 2 : 0;
  const units = columns + aisles * AISLE + edgeUnits;
  const pitch = availableWidth / units;
  const rowPitch = pitch * 1.2;
  const screenHeight = pitch * 5;

  return {
    pitch,
    rowPitch,
    seatWidth: pitch * 0.6,
    labelWidth: showRowLabels ? pitch : 0,
    aisleWidth: pitch * AISLE,
    screenHeight,
    width: availableWidth,
    height: screenHeight + layout.rowLabels.length * rowPitch,
  };
}
