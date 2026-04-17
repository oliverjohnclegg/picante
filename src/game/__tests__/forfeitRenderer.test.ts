import { renderForfeitText, resolvePenalty } from '@game/forfeitRenderer';
import type { ForfeitTemplate, Player } from '@game/types';

const mk = (id: string, name: string = id): Player => ({
  id,
  name,
  abv: 0.2,
  difficulty: 'tradicional',
  gender: 'man',
  attractedTo: [],
  rawPenalties: 0,
  penaltiesSinceLastShot: 0,
  shotsTaken: 0,
  threshold: 6,
  status: 'active',
});

describe('renderForfeitText', () => {
  it('substitutes drawer and biasedRandom tokens', () => {
    const template: ForfeitTemplate = {
      suit: 'hearts',
      value: 5,
      text: '{{biasedRandom}} asks {{drawer}} a question.',
      penalty: 'cardValue',
      targetingMode: 'any',
    };
    const result = renderForfeitText(template, {
      drawer: mk('d', 'Drake'),
      biasedRandom: mk('b', 'Bea'),
    });
    expect(result).toBe('Bea asks Drake a question.');
  });

  it('renders ??? for missing biasedRandom', () => {
    const template: ForfeitTemplate = {
      suit: 'diamonds',
      value: 'J',
      text: '{{drawer}} dares {{biasedRandom}}.',
      penalty: 10,
      targetingMode: 'any',
    };
    const result = renderForfeitText(template, {
      drawer: mk('d', 'Drake'),
      biasedRandom: null,
    });
    expect(result).toBe('Drake dares ???.');
  });
});

describe('resolvePenalty', () => {
  it('cardValue maps to face value', () => {
    expect(resolvePenalty(7, 'cardValue')).toBe(7);
    expect(resolvePenalty('J', 'cardValue')).toBe(10);
    expect(resolvePenalty('K', 'cardValue')).toBe(15);
  });

  it('cardValueHalf rounds up', () => {
    expect(resolvePenalty(5, 'cardValueHalf')).toBe(3);
    expect(resolvePenalty('K', 'cardValueHalf')).toBe(8);
  });

  it('fixed number passes through', () => {
    expect(resolvePenalty('Q', 12)).toBe(12);
  });
});
