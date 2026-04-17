import type { Card, CardValue, Suit } from '@game/types';

export const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];
export const VALUES: readonly CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, id: `${suit}-${value}` });
    }
  }
  return deck;
}

export function shuffleDeck<T>(deck: T[], rng: () => number = Math.random): T[] {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

export function buildShuffledDeck(rng: () => number = Math.random): Card[] {
  return shuffleDeck(buildDeck(), rng);
}

export function drawCard(deck: Card[]): { card: Card | null; remaining: Card[] } {
  if (deck.length === 0) return { card: null, remaining: deck };
  const [card, ...remaining] = deck;
  return { card: card ?? null, remaining };
}

export function cardPenaltyValue(value: CardValue): number {
  if (value === 'J' || value === 'Q') return 10;
  if (value === 'K') return 15;
  if (value === 'A') return 0;
  return value;
}
