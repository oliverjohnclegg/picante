import type {
  CardValue,
  ForfeitTemplate,
  Pack,
  PackId,
  Suit,
} from '@game/types';
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

export function findForfeit(
  pack: Pack,
  suit: Suit,
  value: CardValue,
): ForfeitTemplate {
  const match = pack.forfeits.find(
    (f) => f.suit === suit && f.value === value,
  );
  if (!match) {
    throw new Error(
      `Pack "${pack.id}" missing forfeit for ${suit}-${value}`,
    );
  }
  return match;
}

export function validatePack(pack: Pack): string[] {
  const errors: string[] = [];
  const expectedSuits: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];
  const expectedValues: CardValue[] = [
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    'J',
    'Q',
    'K',
    'A',
  ];

  for (const suit of expectedSuits) {
    for (const value of expectedValues) {
      const entries = pack.forfeits.filter(
        (f) => f.suit === suit && f.value === value,
      );
      if (entries.length === 0) {
        errors.push(`Missing ${suit}-${value}`);
      } else if (entries.length > 1) {
        errors.push(`Duplicate ${suit}-${value} (${entries.length} entries)`);
      }
    }
  }

  for (const f of pack.forfeits) {
    if (!['hearts', 'diamonds', 'spades', 'clubs'].includes(f.suit)) {
      errors.push(`Invalid suit: ${f.suit}`);
    }
    if (!expectedValues.includes(f.value)) {
      errors.push(`Invalid value: ${f.value}`);
    }
    if (!['any', 'physical'].includes(f.targetingMode)) {
      errors.push(`Invalid targetingMode on ${f.suit}-${f.value}`);
    }
  }

  return errors;
}
