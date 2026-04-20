import type { Player } from '@game/types';
import { computeAwards, topDrinker, ironLiver, glassSlipper, snowball } from '@game/awards';

function player(overrides: Partial<Player>): Player {
  return {
    id: 'p',
    name: 'Player',
    abv: 0.2,
    difficulty: 'tradicional',
    gender: 'man',
    attractedTo: [],
    rawPenalties: 0,
    penaltiesSinceLastShot: 0,
    shotsTaken: 0,
    threshold: 10,
    status: 'active',
    ...overrides,
  };
}

describe('awards resolvers', () => {
  describe('topDrinker', () => {
    it('picks the player with the most shots', () => {
      const result = topDrinker([
        player({ id: 'a', name: 'Alex', shotsTaken: 1, rawPenalties: 10 }),
        player({ id: 'b', name: 'Bea', shotsTaken: 3, rawPenalties: 30 }),
        player({ id: 'c', name: 'Cal', shotsTaken: 2, rawPenalties: 20 }),
      ]);
      expect(result?.player.id).toBe('b');
      expect(result?.subtitle).toMatch(/3 shots/);
    });

    it('returns null when no one has taken a shot', () => {
      const result = topDrinker([
        player({ id: 'a', rawPenalties: 5 }),
        player({ id: 'b', rawPenalties: 3 }),
      ]);
      expect(result).toBeNull();
    });
  });

  describe('ironLiver', () => {
    it('picks the high-penalty player who never took a shot', () => {
      const result = ironLiver([
        player({ id: 'a', name: 'Alex', rawPenalties: 40, shotsTaken: 2 }),
        player({ id: 'b', name: 'Bea', rawPenalties: 35, shotsTaken: 0 }),
        player({ id: 'c', name: 'Cal', rawPenalties: 10, shotsTaken: 0 }),
      ]);
      expect(result?.player.id).toBe('b');
    });

    it('returns null when everyone has taken a shot', () => {
      const result = ironLiver([
        player({ id: 'a', shotsTaken: 1, rawPenalties: 10 }),
        player({ id: 'b', shotsTaken: 2, rawPenalties: 20 }),
      ]);
      expect(result).toBeNull();
    });

    it('returns null when nobody has accrued any penalties', () => {
      const result = ironLiver([player({ id: 'a' }), player({ id: 'b' })]);
      expect(result).toBeNull();
    });
  });

  describe('glassSlipper', () => {
    it('picks the participant with the fewest penalties', () => {
      const result = glassSlipper([
        player({ id: 'a', name: 'Alex', rawPenalties: 30 }),
        player({ id: 'b', name: 'Bea', rawPenalties: 5 }),
        player({ id: 'c', name: 'Cal', rawPenalties: 0, shotsTaken: 0 }),
      ]);
      expect(result?.player.id).toBe('b');
    });

    it('returns null when nobody participated', () => {
      const result = glassSlipper([player({ id: 'a' }), player({ id: 'b' })]);
      expect(result).toBeNull();
    });
  });

  describe('snowball', () => {
    it('picks the player with the largest ratio of penalties to threshold', () => {
      const result = snowball([
        player({ id: 'a', rawPenalties: 40, threshold: 10 }),
        player({ id: 'b', rawPenalties: 60, threshold: 5 }),
        player({ id: 'c', rawPenalties: 20, threshold: 10 }),
      ]);
      expect(result?.player.id).toBe('b');
      expect(result?.subtitle).toMatch(/12\.0× their own threshold/);
    });

    it('ignores players with zero threshold', () => {
      const result = snowball([
        player({ id: 'a', rawPenalties: 10, threshold: 0 }),
        player({ id: 'b', rawPenalties: 5, threshold: 5 }),
      ]);
      expect(result?.player.id).toBe('b');
    });
  });

  describe('computeAwards', () => {
    it('produces up to 4 awards and dedupes by player when sensible', () => {
      const players = [
        player({ id: 'a', name: 'Alex', rawPenalties: 40, shotsTaken: 3, threshold: 10 }),
        player({ id: 'b', name: 'Bea', rawPenalties: 25, shotsTaken: 0, threshold: 10 }),
        player({ id: 'c', name: 'Cal', rawPenalties: 5, shotsTaken: 0, threshold: 10 }),
        player({ id: 'd', name: 'Dex', rawPenalties: 12, shotsTaken: 1, threshold: 10 }),
      ];
      const awards = computeAwards(players);
      const ids = awards.map((a) => a.id);
      expect(ids).toContain('topDrinker');
      expect(ids).toContain('ironLiver');
      expect(ids).toContain('glassSlipper');
      expect(awards.length).toBeLessThanOrEqual(4);
    });

    it('returns an empty list when nobody has played', () => {
      const players = [player({ id: 'a' }), player({ id: 'b' })];
      expect(computeAwards(players)).toEqual([]);
    });
  });
});
