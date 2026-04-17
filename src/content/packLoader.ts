import type { CardValue, ForfeitTemplate, Pack, PackId, Suit } from '@game/types';
import tradicional from '@content/packs/tradicional.json';
import diablo from '@content/packs/diablo.json';

const REGISTRY: Record<PackId, Pack> = {
  tradicional: tradicional as Pack,
  diablo: diablo as Pack,
};

export function listPacks(): Pack[] {
  return Object.values(REGISTRY);
}

export function getPack(id: PackId): Pack {
  const pack = REGISTRY[id];
  if (!pack) throw new Error(`Unknown pack: ${id}`);
  return pack;
}

export function findForfeit(pack: Pack, suit: Suit, value: CardValue): ForfeitTemplate {
  const match = pack.forfeits.find((f) => f.suit === suit && f.value === value);
  if (!match) {
    throw new Error(`Pack "${pack.id}" missing forfeit for ${suit}-${value}`);
  }
  return match;
}

const FREE_PASS_PATTERNS = [/no one takes/i, /nobody takes/i, /no penalty/i];
const DRINKING_PATTERNS = [/\btake a drink\b/i, /\btake a sip\b/i, /\btake a shot\b/i, /\bdrink up\b/i];

function expectedRankPenalty(value: CardValue): number | 'cardValue' | null {
  if (value === 'A') return null;
  if (value === 'K') return 15;
  if (value === 'J' || value === 'Q') return 10;
  return 'cardValue';
}

function penaltyMatches(actual: unknown, expected: number | 'cardValue', cardValue: CardValue): boolean {
  if (expected === 'cardValue') {
    if (actual === 'cardValue') return true;
    if (typeof actual === 'number' && typeof cardValue === 'number') return actual === cardValue;
    return false;
  }
  return actual === expected;
}

export function validatePack(pack: Pack): string[] {
  const errors: string[] = [];
  const expectedSuits: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];
  const expectedValues: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

  for (const suit of expectedSuits) {
    for (const value of expectedValues) {
      const entries = pack.forfeits.filter((f) => f.suit === suit && f.value === value);
      if (entries.length === 0) {
        errors.push(`Missing ${suit}-${value}`);
      } else if (entries.length > 1) {
        errors.push(`Duplicate ${suit}-${value} (${entries.length} entries)`);
      }
    }
  }

  for (const f of pack.forfeits) {
    const tag = `${f.suit}-${f.value}`;
    if (!['hearts', 'diamonds', 'spades', 'clubs'].includes(f.suit)) {
      errors.push(`Invalid suit: ${f.suit}`);
    }
    if (!expectedValues.includes(f.value)) {
      errors.push(`Invalid value: ${f.value}`);
    }
    if (!['any', 'physical'].includes(f.targetingMode)) {
      errors.push(`Invalid targetingMode on ${tag}`);
    }
    if (
      f.resolution !== undefined &&
      !['choose', 'distribute', 'auto', 'splitDrawerChoose'].includes(f.resolution)
    ) {
      errors.push(`Invalid resolution on ${tag}`);
    }

    const expectedPenalty = expectedRankPenalty(f.value);
    if (expectedPenalty !== null && !penaltyMatches(f.penalty, expectedPenalty, f.value)) {
      errors.push(
        `Penalty on ${tag} violates rule 7 (expected ${expectedPenalty}, got ${JSON.stringify(f.penalty)})`,
      );
    }

    if (FREE_PASS_PATTERNS.some((re) => re.test(f.text))) {
      errors.push(`Text on ${tag} allows everyone to walk free — violates rule 2`);
    }

    if (DRINKING_PATTERNS.some((re) => re.test(f.text))) {
      errors.push(`Text on ${tag} commands a drink — violates rule 6`);
    }
  }

  return errors;
}
