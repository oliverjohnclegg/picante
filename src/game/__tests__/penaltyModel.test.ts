import {
  applyPenalties,
  computeThreshold,
  rawPenaltyProgressRatio,
  recomputePlayerThresholds,
  shotProgressRatio,
} from '@game/penaltyModel';
import type { Player } from '@game/types';

const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'p1',
  name: 'Player',
  abv: 0.2,
  difficulty: 'tradicional',
  gender: 'man',
  attractedTo: [],
  rawPenalties: 0,
  penaltiesSinceLastShot: 0,
  shotsTaken: 0,
  threshold: 6,
  status: 'active',
  ...overrides,
});

describe('computeThreshold — reference calibration', () => {
  it('Fin: 4% ABV, 5 players, Tradicional -> 1', () => {
    expect(computeThreshold(0.04, 5, 'tradicional')).toBe(1);
  });

  it('Con: 20% ABV, 5 players, Tradicional -> 6', () => {
    expect(computeThreshold(0.2, 5, 'tradicional')).toBe(6);
  });

  it('Clara: 20% ABV, 5 players, Passive -> 9', () => {
    expect(computeThreshold(0.2, 5, 'passive')).toBe(9);
  });

  it('Clegg: 15% ABV, 5 players, Muerte -> 3', () => {
    expect(computeThreshold(0.15, 5, 'muerte')).toBe(3);
  });

  it('Harley: 37.5% ABV, 5 players, Tradicional -> 12', () => {
    expect(computeThreshold(0.375, 5, 'tradicional')).toBe(12);
  });
});

describe('computeThreshold — extrapolation', () => {
  it('scales down with more players (more players = tighter thresholds)', () => {
    const t5 = computeThreshold(0.2, 5, 'tradicional');
    const t10 = computeThreshold(0.2, 10, 'tradicional');
    const t16 = computeThreshold(0.2, 16, 'tradicional');
    expect(t10).toBeLessThan(t5);
    expect(t16).toBeLessThanOrEqual(t10);
  });

  it('never returns below 1', () => {
    expect(computeThreshold(0.01, 16, 'muerte')).toBe(1);
  });

  it('scales up with fewer players', () => {
    const t5 = computeThreshold(0.2, 5, 'tradicional');
    const t4 = computeThreshold(0.2, 4, 'tradicional');
    const t3 = computeThreshold(0.2, 3, 'tradicional');
    expect(t4).toBeGreaterThan(t5);
    expect(t3).toBeGreaterThan(t4);
  });
});

describe('applyPenalties', () => {
  it('accumulates raw and progress counters', () => {
    const { player, pendingShots } = applyPenalties(makePlayer(), 3);
    expect(player.rawPenalties).toBe(3);
    expect(player.penaltiesSinceLastShot).toBe(3);
    expect(pendingShots).toBe(0);
  });

  it('triggers a shot when progress crosses threshold', () => {
    const { player, pendingShots } = applyPenalties(
      makePlayer({ threshold: 7, penaltiesSinceLastShot: 3 }),
      5,
    );
    expect(pendingShots).toBe(1);
    expect(player.shotsTaken).toBe(1);
    expect(player.penaltiesSinceLastShot).toBe(1);
    expect(player.rawPenalties).toBe(5);
  });

  it('batches multi-shot when a single hit crosses multiple thresholds', () => {
    const { player, pendingShots } = applyPenalties(
      makePlayer({ threshold: 7, penaltiesSinceLastShot: 3 }),
      20,
    );
    expect(pendingShots).toBe(3);
    expect(player.shotsTaken).toBe(3);
    expect(player.penaltiesSinceLastShot).toBe(2);
    expect(player.rawPenalties).toBe(20);
  });

  it('is idempotent for zero penalties', () => {
    const before = makePlayer({ rawPenalties: 5, penaltiesSinceLastShot: 2 });
    const { player, pendingShots } = applyPenalties(before, 0);
    expect(pendingShots).toBe(0);
    expect(player).toEqual(before);
  });

  it('never goes negative on threshold edge', () => {
    const { player, pendingShots } = applyPenalties(
      makePlayer({ threshold: 7, penaltiesSinceLastShot: 0 }),
      7,
    );
    expect(pendingShots).toBe(1);
    expect(player.penaltiesSinceLastShot).toBe(0);
  });
});

describe('recomputePlayerThresholds — mid-game roster mutation', () => {
  it('recomputes active players only', () => {
    const players = [
      makePlayer({ id: 'a', abv: 0.2, threshold: 6 }),
      makePlayer({ id: 'b', abv: 0.4, threshold: 12, status: 'removed' }),
    ];
    const updated = recomputePlayerThresholds(players, 8);
    expect(updated[0]!.threshold).not.toBe(6);
    expect(updated[1]!.threshold).toBe(12);
  });
});

describe('shotProgressRatio', () => {
  it('0 progress -> 0', () => {
    expect(shotProgressRatio(makePlayer({ penaltiesSinceLastShot: 0 }))).toBe(0);
  });
  it('clamps at 1', () => {
    expect(shotProgressRatio(makePlayer({ penaltiesSinceLastShot: 100 }))).toBe(1);
  });
});

describe('rawPenaltyProgressRatio', () => {
  it('scales by max among active', () => {
    expect(rawPenaltyProgressRatio(25, 100)).toBe(0.25);
    expect(rawPenaltyProgressRatio(100, 100)).toBe(1);
  });
  it('uses denominator at least 1 when max is 0', () => {
    expect(rawPenaltyProgressRatio(0, 0)).toBe(0);
    expect(rawPenaltyProgressRatio(5, 0)).toBe(1);
  });
});
