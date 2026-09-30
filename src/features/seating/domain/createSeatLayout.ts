import type { Seat, SeatLayout, SeatRow, SeatSection } from './types';

export interface SectionConfig {
  id: string;
  /** Grid width of the block. */
  columns: number;
  /** Seats in each row (index 0 = front). Shorter rows leave empty cells. */
  seatsPerRow: number[];
  /** Which side short rows hug: the aisle side keeps the block's shape. */
  align: 'start' | 'center' | 'end';
}

export interface HallConfig {
  id: string;
  sections: SectionConfig[];
  /** Row labels (front to back) whose seats are VIP. */
  vipRows: string[];
  /** Share of seats already sold, 0–1. */
  occupancy: number;
  /** Seeds the pseudo-random sold seats, so a showtime is stable. */
  seed: string;
}

/** Deterministic PRNG (mulberry32) seeded from a string. */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function offsetFor(
  align: SectionConfig['align'],
  columns: number,
  seats: number,
) {
  const empty = columns - seats;
  if (align === 'end') {
    return empty;
  }
  return align === 'center' ? Math.floor(empty / 2) : 0;
}

/** Builds a seat layout from a hall description. Pure and deterministic. */
export function createSeatLayout(config: HallConfig): SeatLayout {
  const rowCount = Math.max(...config.sections.map(s => s.seatsPerRow.length));
  const rowLabels = Array.from({ length: rowCount }, (_, i) => String(i + 1));
  const random = seededRandom(config.seed);

  const sections: SeatSection[] = config.sections.map(section => ({
    id: section.id,
    rows: [],
  }));

  rowLabels.forEach((label, rowIndex) => {
    let seatNumber = 0;
    const type = config.vipRows.includes(label) ? 'vip' : 'regular';

    config.sections.forEach((section, sectionIndex) => {
      const count = section.seatsPerRow[rowIndex] ?? 0;
      const offset = offsetFor(section.align, section.columns, count);
      const seats: (Seat | null)[] = Array.from(
        { length: section.columns },
        (_, col) => {
          if (col < offset || col >= offset + count) {
            return null;
          }
          seatNumber += 1;
          return {
            id: `${label}-${seatNumber}`,
            row: label,
            number: seatNumber,
            type,
            status: random() < config.occupancy ? 'taken' : 'free',
          };
        },
      );
      const row: SeatRow = { label, seats };
      sections[sectionIndex].rows.push(row);
    });
  });

  return { id: config.id, screenLabel: 'SCREEN', rowLabels, sections };
}

/** Every seat in the layout, in row then seat-number order. */
export function allSeats(layout: SeatLayout): Seat[] {
  const seats: Seat[] = [];
  layout.rowLabels.forEach((_, rowIndex) => {
    layout.sections.forEach(section => {
      section.rows[rowIndex]?.seats.forEach(seat => {
        if (seat) {
          seats.push(seat);
        }
      });
    });
  });
  return seats;
}

/** The hall from the mockups: 10 rows, curved side blocks, VIP back row. */
export function standardHall(id: string, seed: string): HallConfig {
  const sideRows = [2, 4, 4, 4, 5, 5, 5, 5, 5, 5];
  return {
    id,
    seed,
    occupancy: 0.45,
    vipRows: ['10'],
    sections: [
      { id: 'left', columns: 5, seatsPerRow: sideRows, align: 'end' },
      {
        id: 'centre',
        columns: 14,
        seatsPerRow: Array(10).fill(14),
        align: 'center',
      },
      { id: 'right', columns: 5, seatsPerRow: sideRows, align: 'start' },
    ],
  };
}
