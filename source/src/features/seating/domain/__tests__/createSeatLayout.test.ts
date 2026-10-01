import { allSeats, createSeatLayout, standardHall } from '../createSeatLayout';

describe('createSeatLayout', () => {
  const layout = createSeatLayout(standardHall('hall-1', 'seed-a'));

  it('builds left, centre and right sections with 10 rows each', () => {
    expect(layout.sections.map(s => s.id)).toEqual(['left', 'centre', 'right']);
    expect(layout.rowLabels).toHaveLength(10);
    layout.sections.forEach(s => expect(s.rows).toHaveLength(10));
  });

  it('leaves empty cells on the outer edge of short side rows (curved shape)', () => {
    const [left, , right] = layout.sections;
    const occupied = (cells: unknown[]) => cells.map(c => (c ? 1 : 0));
    expect(occupied(left.rows[0].seats)).toEqual([0, 0, 0, 1, 1]);
    expect(occupied(right.rows[0].seats)).toEqual([1, 1, 0, 0, 0]);
    expect(occupied(left.rows[9].seats)).toEqual([1, 1, 1, 1, 1]);
  });

  it('numbers seats left to right across the whole row', () => {
    const row1 = allSeats(layout).filter(s => s.row === '1');
    expect(row1.map(s => s.number)).toEqual(
      Array.from({ length: 18 }, (_, i) => i + 1),
    );
    expect(new Set(allSeats(layout).map(s => s.id)).size).toBe(
      allSeats(layout).length,
    );
  });

  it('makes only the back row VIP', () => {
    const vipRows = new Set(
      allSeats(layout)
        .filter(s => s.type === 'vip')
        .map(s => s.row),
    );
    expect([...vipRows]).toEqual(['10']);
  });

  it('is deterministic for a seed and differs between seeds', () => {
    const statuses = (seed: string) =>
      allSeats(createSeatLayout(standardHall('h', seed))).map(s => s.status);
    expect(statuses('seed-a')).toEqual(statuses('seed-a'));
    expect(statuses('seed-a')).not.toEqual(statuses('seed-b'));
  });
});
