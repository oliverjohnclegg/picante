import { findForfeit, getPack, listPacks, validatePack } from '@content/packLoader';
import type { CardValue, Pack, PenaltySpec, Suit } from '@game/types';

const allSuits: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];
const allValues: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

const expectedPenaltyFor = (value: CardValue): PenaltySpec => {
  if (value === 'A') return 0;
  if (value === 'K') return 15;
  if (value === 'J' || value === 'Q') return 10;
  return 'cardValue';
};

const buildMinimalValidPack = (): Pack => ({
  id: 'tradicional',
  name: 'Test Pack',
  description: 'synthetic',
  forfeits: allSuits.flatMap((suit) =>
    allValues.map((value) => ({
      suit,
      value,
      text: `Rule text for ${suit}-${value}. Cop-out keeps consequences.`,
      penalty: expectedPenaltyFor(value),
      targetingMode: 'any' as const,
    })),
  ),
});

describe('packLoader helpers', () => {
  it('lists both registered packs', () => {
    const packs = listPacks()
      .map((p) => p.id)
      .sort();
    expect(packs).toEqual(['diablo', 'tradicional']);
  });

  it('loads known packs', () => {
    expect(getPack('tradicional').id).toBe('tradicional');
    expect(getPack('diablo').id).toBe('diablo');
  });

  it('throws for unknown pack id', () => {
    expect(() => getPack('unknown' as never)).toThrow('Unknown pack');
  });

  it('finds card-specific forfeits', () => {
    const pack = getPack('tradicional');
    const forfeit = findForfeit(pack, 'hearts', 2);
    expect(forfeit.suit).toBe('hearts');
    expect(forfeit.value).toBe(2);
  });

  it('throws when card mapping is missing', () => {
    const pack = buildMinimalValidPack();
    pack.forfeits = pack.forfeits.filter((f) => !(f.suit === 'spades' && f.value === 7));
    expect(() => findForfeit(pack, 'spades', 7)).toThrow('missing forfeit for spades-7');
  });
});

describe('validatePack', () => {
  it('returns no errors for a synthetically valid pack', () => {
    expect(validatePack(buildMinimalValidPack())).toEqual([]);
  });

  it('flags duplicate and missing card slots', () => {
    const pack = buildMinimalValidPack();
    const duplicateSource = pack.forfeits.find((f) => f.suit === 'hearts' && f.value === 2)!;
    pack.forfeits = pack.forfeits.filter((f) => !(f.suit === 'diamonds' && f.value === 4));
    pack.forfeits.push({
      ...duplicateSource,
      suit: 'hearts',
      value: 3,
    });
    const errors = validatePack(pack);
    expect(errors).toContain('Missing diamonds-4');
    expect(errors.some((e) => e.startsWith('Duplicate hearts-3'))).toBe(true);
  });

  it('flags invalid suit, value, targeting mode, and resolution', () => {
    const pack = buildMinimalValidPack();
    pack.forfeits[0] = {
      ...pack.forfeits[0]!,
      suit: 'stars' as never,
      value: 42 as never,
      targetingMode: 'biased' as never,
      resolution: 'roulette' as never,
    };
    const errors = validatePack(pack);
    expect(errors).toContain('Invalid suit: stars');
    expect(errors).toContain('Invalid value: 42');
    expect(errors).toContain('Invalid targetingMode on stars-42');
    expect(errors).toContain('Invalid resolution on stars-42');
  });

  it('flags penalty-rule violations', () => {
    const pack = buildMinimalValidPack();
    pack.forfeits = pack.forfeits.map((f) =>
      f.suit === 'clubs' && f.value === 9 ? { ...f, penalty: 1 } : f,
    );
    const errors = validatePack(pack);
    expect(errors.some((e) => e.includes('Penalty on clubs-9 violates rule 7'))).toBe(true);
  });

  it('accepts cardValue numbers equal to numeric rank', () => {
    const pack = buildMinimalValidPack();
    pack.forfeits = pack.forfeits.map((f) =>
      f.suit === 'spades' && f.value === 7 ? { ...f, penalty: 7 } : f,
    );
    expect(validatePack(pack)).toEqual([]);
  });

  it('rejects cardValue numbers that do not match the rank', () => {
    const pack = buildMinimalValidPack();
    pack.forfeits = pack.forfeits.map((f) =>
      f.suit === 'spades' && f.value === 7 ? { ...f, penalty: 8 } : f,
    );
    const errors = validatePack(pack);
    expect(errors.some((e) => e.includes('Penalty on spades-7 violates rule 7'))).toBe(true);
  });

  it('flags free-pass and drinking command language', () => {
    const pack = buildMinimalValidPack();
    pack.forfeits = pack.forfeits.map((f) =>
      f.suit === 'diamonds' && f.value === 8
        ? { ...f, text: 'No penalty this round, everybody can drink up.' }
        : f,
    );
    const errors = validatePack(pack);
    expect(errors).toContain('Text on diamonds-8 allows everyone to walk free — violates rule 2');
    expect(errors).toContain('Text on diamonds-8 commands a drink — violates rule 6');
  });
});
