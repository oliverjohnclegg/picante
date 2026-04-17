import {
  buildDeck,
  buildShuffledDeck,
  cardPenaltyValue,
  drawCard,
  shuffleDeck,
} from '@game/deck';

describe('buildDeck', () => {
  it('produces 52 unique cards', () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(52);
    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(52);
  });

  it('includes 13 cards per suit', () => {
    const deck = buildDeck();
    for (const suit of ['hearts', 'diamonds', 'spades', 'clubs']) {
      expect(deck.filter((c) => c.suit === suit)).toHaveLength(13);
    }
  });
});

describe('shuffleDeck', () => {
  it('returns a permutation', () => {
    const deck = buildDeck();
    const shuffled = shuffleDeck(deck, () => 0.5);
    expect(shuffled).toHaveLength(deck.length);
    expect(new Set(shuffled.map((c) => c.id)).size).toBe(52);
  });

  it('does not mutate input', () => {
    const deck = buildDeck();
    const snapshot = JSON.stringify(deck);
    shuffleDeck(deck);
    expect(JSON.stringify(deck)).toBe(snapshot);
  });
});

describe('drawCard', () => {
  it('pops the top card', () => {
    const deck = buildShuffledDeck(() => 0);
    const { card, remaining } = drawCard(deck);
    expect(card).not.toBeNull();
    expect(remaining).toHaveLength(51);
  });

  it('returns null when empty', () => {
    const { card, remaining } = drawCard([]);
    expect(card).toBeNull();
    expect(remaining).toHaveLength(0);
  });
});

describe('cardPenaltyValue', () => {
  it.each([
    [2, 2],
    [5, 5],
    [10, 10],
    ['J', 10],
    ['Q', 10],
    ['K', 15],
    ['A', 0],
  ])('value %s -> %s penalties', (value, expected) => {
    expect(cardPenaltyValue(value as any)).toBe(expected);
  });
});
