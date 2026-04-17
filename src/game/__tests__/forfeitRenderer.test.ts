import {
  neighbour,
  renderForfeitText,
  resolvePenalty,
} from '@game/forfeitRenderer';
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

describe('neighbour', () => {
  const players = [mk('a'), mk('b'), mk('c'), mk('d')];
  it('cw at end wraps to head', () => {
    expect(neighbour(players, 3, 'cw').id).toBe('a');
  });
  it('ccw at head wraps to end', () => {
    expect(neighbour(players, 0, 'ccw').id).toBe('d');
  });
});

describe('renderForfeitText', () => {
  it('substitutes all tokens', () => {
    const template: ForfeitTemplate = {
      suit: 'hearts',
      value: 5,
      text: '{{ccw}} asks {{drawer}} a question. {{biasedRandom}} watches.',
      penalty: 'cardValue',
      targetingMode: 'any',
    };
    const result = renderForfeitText(template, {
      drawer: mk('d', 'Drake'),
      cw: mk('c', 'Clara'),
      ccw: mk('e', 'Elena'),
      biasedRandom: mk('b', 'Bea'),
    });
    expect(result).toBe('Elena asks Drake a question. Bea watches.');
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
      cw: mk('c', 'Clara'),
      ccw: mk('e', 'Elena'),
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
