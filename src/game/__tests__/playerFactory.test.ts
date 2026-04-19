import { makePlayer, type PlayerDraft } from '@game/playerFactory';
import { computeThreshold } from '@game/penaltyModel';

describe('makePlayer', () => {
  const draft: PlayerDraft = {
    name: 'Rafa',
    abv: 0.2,
    difficulty: 'tradicional',
    gender: 'man',
    attractedTo: ['woman'],
  };

  it('creates a fully initialised active player', () => {
    const player = makePlayer(draft, 5);
    expect(player.name).toBe('Rafa');
    expect(player.abv).toBe(0.2);
    expect(player.difficulty).toBe('tradicional');
    expect(player.gender).toBe('man');
    expect(player.attractedTo).toEqual(['woman']);
    expect(player.rawPenalties).toBe(0);
    expect(player.penaltiesSinceLastShot).toBe(0);
    expect(player.shotsTaken).toBe(0);
    expect(player.status).toBe('active');
    expect(player.threshold).toBe(computeThreshold(0.2, 5, 'tradicional'));
    expect(player.id).toMatch(/^p_/);
  });

  it('creates unique ids across consecutive players', () => {
    const one = makePlayer(draft, 5);
    const two = makePlayer({ ...draft, name: 'Luna' }, 5);
    expect(one.id).not.toBe(two.id);
  });
});
