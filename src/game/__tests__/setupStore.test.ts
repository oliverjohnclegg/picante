import { MAX_PLAYERS, useSetupStore } from '@game/setupStore';
import type { PlayerDraft } from '@game/playerFactory';

const buildDraft = (name: string): PlayerDraft => ({
  name,
  abv: 0.2,
  difficulty: 'tradicional',
  gender: 'man',
  attractedTo: ['woman'],
});

describe('useSetupStore', () => {
  beforeEach(() => {
    useSetupStore.getState().reset();
  });

  it('sets mode', () => {
    useSetupStore.getState().setMode('diablo');
    expect(useSetupStore.getState().mode).toBe('diablo');
  });

  it('adds drafts up to MAX_PLAYERS and stops there', () => {
    for (let i = 0; i < MAX_PLAYERS + 2; i++) {
      useSetupStore.getState().addDraft(buildDraft(`Player ${i}`));
    }
    expect(useSetupStore.getState().drafts).toHaveLength(MAX_PLAYERS);
  });

  it('updates a draft in place', () => {
    useSetupStore.getState().addDraft(buildDraft('Initial'));
    useSetupStore.getState().updateDraft(0, { name: 'Updated', difficulty: 'muerte' });
    expect(useSetupStore.getState().drafts[0]).toMatchObject({
      name: 'Updated',
      difficulty: 'muerte',
    });
  });

  it('ignores out-of-range update index', () => {
    useSetupStore.getState().addDraft(buildDraft('Only'));
    const before = useSetupStore.getState().drafts;
    useSetupStore.getState().updateDraft(9, { name: 'Never' });
    expect(useSetupStore.getState().drafts).toEqual(before);
  });

  it('removes draft by index', () => {
    useSetupStore.getState().addDraft(buildDraft('A'));
    useSetupStore.getState().addDraft(buildDraft('B'));
    useSetupStore.getState().removeDraft(0);
    expect(useSetupStore.getState().drafts.map((d) => d.name)).toEqual(['B']);
  });

  it('reset restores defaults', () => {
    useSetupStore.getState().setMode('diablo');
    useSetupStore.getState().addDraft(buildDraft('A'));
    useSetupStore.getState().reset();
    expect(useSetupStore.getState().mode).toBe('tradicional');
    expect(useSetupStore.getState().drafts).toEqual([]);
  });
});
