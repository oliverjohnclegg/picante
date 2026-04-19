import { cardTitle } from '@game/cardTitle';
import type { Card } from '@game/types';

describe('cardTitle', () => {
  it('renders numeric card values', () => {
    const card: Card = { suit: 'hearts', value: 7, id: 'hearts-7' };
    expect(cardTitle(card)).toBe('7 of Hearts');
  });

  it.each([
    ['J', 'diamonds', 'Jack of Diamonds'],
    ['Q', 'spades', 'Queen of Spades'],
    ['K', 'clubs', 'King of Clubs'],
    ['A', 'hearts', 'Ace of Hearts'],
  ] as const)('renders face card %s as %s', (value, suit, expected) => {
    const card: Card = { suit, value, id: `${suit}-${value}` };
    expect(cardTitle(card)).toBe(expected);
  });
});
