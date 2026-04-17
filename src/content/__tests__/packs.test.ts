import { getPack, validatePack } from '@content/packLoader';

describe('content packs', () => {
  it.each(['tradicional', 'diablo'] as const)(
    'pack %s validates cleanly (all 52 cards, no duplicates)',
    (id) => {
      const pack = getPack(id);
      const errors = validatePack(pack);
      expect(errors).toEqual([]);
    },
  );

  it.each(['tradicional', 'diablo'] as const)(
    'pack %s exposes 52 forfeits',
    (id) => {
      expect(getPack(id).forfeits).toHaveLength(52);
    },
  );

  it.each(['tradicional', 'diablo'] as const)(
    'pack %s uses physical targeting only on Q♦ and Q♠',
    (id) => {
      const pack = getPack(id);
      const physical = pack.forfeits.filter((f) => f.targetingMode === 'physical');
      const keys = physical.map((f) => `${f.suit}-${f.value}`).sort();
      expect(keys).toEqual(['diamonds-Q', 'spades-Q']);
    },
  );

  it.each(['tradicional', 'diablo'] as const)(
    'pack %s has mini-games on all 9 numbered clubs + J/Q/K',
    (id) => {
      const pack = getPack(id);
      const clubs = pack.forfeits.filter((f) => f.suit === 'clubs');
      const withMg = clubs.filter((c) => c.miniGame);
      expect(withMg.length).toBe(12);
    },
  );
});
