import type { Card, Suit } from '@game/types';

const SUIT_NAMES: Record<Suit, string> = {
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  spades: 'Spades',
  clubs: 'Clubs',
};

const FACE_NAMES: Record<string, string> = {
  J: 'Jack',
  Q: 'Queen',
  K: 'King',
  A: 'Ace',
};

export function cardTitle(card: Card): string {
  const value = typeof card.value === 'number' ? String(card.value) : FACE_NAMES[card.value] ?? card.value;
  return `${value} of ${SUIT_NAMES[card.suit]}`;
}
