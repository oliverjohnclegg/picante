import { computeDrawerSplit } from '@game/splitShares';

describe('computeDrawerSplit', () => {
  it.each([
    [2, 1, 1],
    [3, 2, 1],
    [4, 2, 2],
    [5, 3, 2],
    [9, 5, 4],
    [10, 5, 5],
  ])('splits %i into drawer=%i and other=%i', (total, drawer, other) => {
    const result = computeDrawerSplit(total);
    expect(result.drawerShare).toBe(drawer);
    expect(result.otherShare).toBe(other);
    expect(result.drawerShare + result.otherShare).toBe(total);
  });

  it('handles zero total', () => {
    expect(computeDrawerSplit(0)).toEqual({ drawerShare: 0, otherShare: 0 });
  });

  it('clamps negative totals to zero', () => {
    expect(computeDrawerSplit(-4)).toEqual({ drawerShare: 0, otherShare: 0 });
  });
});
