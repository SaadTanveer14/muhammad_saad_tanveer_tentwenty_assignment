import { columnsFor, computeLayout } from '../useResponsive';

describe('computeLayout', () => {
  it.each([
    [375, 812, 'compact'],
    [667, 375, 'medium'],
    [834, 1194, 'medium'],
    [1194, 834, 'expanded'],
  ])('classifies %ix%i as %s', (width, height, sizeClass) => {
    expect(computeLayout(width, height).sizeClass).toBe(sizeClass);
  });

  it('reports landscape from the aspect ratio, not the size class', () => {
    expect(computeLayout(667, 375).isLandscape).toBe(true);
    expect(computeLayout(834, 1194).isLandscape).toBe(false);
  });
});

describe('columnsFor', () => {
  it('fits one hero card on a portrait phone and more when wider', () => {
    expect(columnsFor(335, 320, 20)).toBe(1);
    expect(columnsFor(794, 320, 20)).toBe(2);
    expect(columnsFor(1154, 320, 20)).toBe(3);
  });

  it('clamps to the maximum column count', () => {
    expect(columnsFor(2000, 150, 10, 5)).toBe(5);
  });

  it('never returns fewer than one column', () => {
    expect(columnsFor(100, 320, 20)).toBe(1);
  });
});
