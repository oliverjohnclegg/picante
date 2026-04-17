import {
  ATTRACTION_WEIGHTS,
  attractionWeight,
  computeWeights,
  lowPenWeight,
  pickBiasedRandom,
} from '@game/targeting';
import type { Player } from '@game/types';

const mk = (overrides: Partial<Player>): Player => ({
  id: 'x',
  name: 'x',
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

describe('lowPenWeight', () => {
  it('assigns higher weight to lower-penalty players', () => {
    const candidates = [
      mk({ id: 'a', rawPenalties: 0 }),
      mk({ id: 'b', rawPenalties: 5 }),
      mk({ id: 'c', rawPenalties: 20 }),
    ];
    const wA = lowPenWeight(candidates[0]!, candidates);
    const wC = lowPenWeight(candidates[2]!, candidates);
    expect(wA).toBeGreaterThan(wC);
  });

  it('never returns zero (leader still eligible)', () => {
    const candidates = [
      mk({ id: 'a', rawPenalties: 10 }),
      mk({ id: 'b', rawPenalties: 10 }),
    ];
    expect(lowPenWeight(candidates[0]!, candidates)).toBeGreaterThan(0);
  });
});

describe('attractionWeight', () => {
  const straightMan = mk({ id: 'sm', gender: 'man', attractedTo: ['woman'] });
  const straightWoman = mk({ id: 'sw', gender: 'woman', attractedTo: ['man'] });
  const gayMan = mk({ id: 'gm', gender: 'man', attractedTo: ['man'] });
  const asexual = mk({ id: 'ac', gender: 'nonbinary', attractedTo: [] });

  it('any mode always 1.0', () => {
    expect(attractionWeight(straightMan, straightWoman, 'any')).toBe(1.0);
  });

  it('physical + mutual attraction -> 3.0', () => {
    expect(attractionWeight(straightMan, straightWoman, 'physical')).toBe(
      ATTRACTION_WEIGHTS.mutual,
    );
  });

  it('physical + no attraction (both asexual) -> 0.3 (still non-zero)', () => {
    const asexA = mk({ id: 'ax1', gender: 'man', attractedTo: [] });
    const asexB = mk({ id: 'ax2', gender: 'woman', attractedTo: [] });
    expect(attractionWeight(asexA, asexB, 'physical')).toBe(
      ATTRACTION_WEIGHTS.neither,
    );
  });

  it('physical + asymmetric one-way -> 1.0', () => {
    expect(attractionWeight(straightMan, gayMan, 'physical')).toBe(
      ATTRACTION_WEIGHTS.oneSided,
    );
  });

  it('physical + one-sided -> 1.0', () => {
    const bi = mk({ id: 'bi', gender: 'woman', attractedTo: ['man', 'woman'] });
    expect(attractionWeight(straightMan, bi, 'physical')).toBe(
      ATTRACTION_WEIGHTS.mutual,
    );
    const outcome = attractionWeight(gayMan, bi, 'physical');
    expect(outcome).toBe(ATTRACTION_WEIGHTS.oneSided);
  });

  it('physical + asexual candidate -> not mutual', () => {
    expect(attractionWeight(straightMan, asexual, 'physical')).toBeLessThan(
      ATTRACTION_WEIGHTS.mutual,
    );
  });
});

describe('computeWeights', () => {
  it('excludes drawer', () => {
    const drawer = mk({ id: 'd' });
    const candidates = [drawer, mk({ id: 'a' }), mk({ id: 'b' })];
    const weights = computeWeights(drawer, candidates, 'any');
    expect(weights.map((w) => w.player.id)).toEqual(['a', 'b']);
  });

  it('excludes removed players', () => {
    const drawer = mk({ id: 'd' });
    const candidates = [drawer, mk({ id: 'a', status: 'removed' }), mk({ id: 'b' })];
    const weights = computeWeights(drawer, candidates, 'any');
    expect(weights.map((w) => w.player.id)).toEqual(['b']);
  });
});

describe('pickBiasedRandom', () => {
  it('is deterministic given an rng', () => {
    const drawer = mk({ id: 'd' });
    const candidates = [drawer, mk({ id: 'a' }), mk({ id: 'b' })];
    const chosen = pickBiasedRandom(drawer, candidates, 'any', () => 0);
    expect(chosen?.id).toBe('a');
  });

  it('returns null if no candidates', () => {
    const drawer = mk({ id: 'd' });
    expect(pickBiasedRandom(drawer, [drawer], 'any')).toBeNull();
  });
});
