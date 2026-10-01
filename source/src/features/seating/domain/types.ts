export type SeatType = 'regular' | 'vip';
export type SeatStatus = 'free' | 'taken';

export interface Seat {
  /** Unique within a layout, e.g. "3-8". */
  id: string;
  row: string;
  /** Position within the row, counted left to right across all sections. */
  number: number;
  type: SeatType;
  status: SeatStatus;
}

export interface SeatRow {
  label: string;
  /** `null` is an empty cell, which is how the curved room shape is drawn. */
  seats: (Seat | null)[];
}

/** A block of seats between aisles (left, centre, right). */
export interface SeatSection {
  id: string;
  rows: SeatRow[];
}

export interface SeatLayout {
  id: string;
  screenLabel: string;
  rowLabels: string[];
  sections: SeatSection[];
}

export type SeatPrices = Record<SeatType, number>;

export const MAX_SELECTION = 8;
