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

  it.each(['tradicional', 'diablo'] as const)('pack %s exposes 52 forfeits', (id) => {
    expect(getPack(id).forfeits).toHaveLength(52);
  });

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

  it.each(['tradicional', 'diablo'] as const)(
    'pack %s uses splitDrawerChoose on every Spades 2-10',
    (id) => {
      const pack = getPack(id);
      const numericSpades = pack.forfeits.filter(
        (f) => f.suit === 'spades' && typeof f.value === 'number',
      );
      expect(numericSpades).toHaveLength(9);
      for (const f of numericSpades) {
        expect(f.resolution).toBe('splitDrawerChoose');
      }
    },
  );

  it.each(['tradicional', 'diablo'] as const)(
    'pack %s penalties match rule 7 (2-10=value, J/Q=10, K=15)',
    (id) => {
      const pack = getPack(id);
      for (const f of pack.forfeits) {
        if (f.value === 'A') continue;
        if (f.value === 'K') {
          expect(f.penalty).toBe(15);
        } else if (f.value === 'J' || f.value === 'Q') {
          expect(f.penalty).toBe(10);
        } else {
          expect(['cardValue', f.value]).toContain(f.penalty);
        }
      }
    },
  );

  it.each(['tradicional', 'diablo'] as const)(
    'pack %s contains no "everyone walks free" branches (rule 2)',
    (id) => {
      const pack = getPack(id);
      for (const f of pack.forfeits) {
        expect(f.text).not.toMatch(/no one takes/i);
        expect(f.text).not.toMatch(/nobody takes/i);
        expect(f.text).not.toMatch(/no penalty/i);
      }
    },
  );

  it.each(['tradicional', 'diablo'] as const)(
    'pack %s never commands drinking (rule 6)',
    (id) => {
      const pack = getPack(id);
      for (const f of pack.forfeits) {
        expect(f.text).not.toMatch(/\btake a drink\b/i);
        expect(f.text).not.toMatch(/\btake a sip\b/i);
        expect(f.text).not.toMatch(/\btake a shot\b/i);
        expect(f.text).not.toMatch(/\bdrink up\b/i);
      }
    },
  );

  it.each(['tradicional', 'diablo'] as const)(
    'pack %s has explicit cop-out language on every non-auto card',
    (id) => {
      const pack = getPack(id);
      const copOutTerms = /cop-out|refuse|decline|refuser|cops out|refuses/i;
      for (const f of pack.forfeits) {
        if (f.resolution === 'auto' || f.value === 'A') continue;
        expect(f.text).toMatch(copOutTerms);
      }
    },
  );

  it.each(['tradicional', 'diablo'] as const)(
    'pack %s uses distribute resolution on Spades J and K (rule 7 + rule 5)',
    (id) => {
      const pack = getPack(id);
      const spadesJ = pack.forfeits.find((f) => f.suit === 'spades' && f.value === 'J');
      const spadesK = pack.forfeits.find((f) => f.suit === 'spades' && f.value === 'K');
      expect(spadesJ?.resolution).toBe('distribute');
      expect(spadesK?.resolution).toBe('distribute');
    },
  );
});
