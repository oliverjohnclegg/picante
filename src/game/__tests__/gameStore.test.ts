jest.mock('@game/persistence', () => ({
  __esModule: true,
  sessionStore: {
    write: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@game/targeting', () => {
  const actual = jest.requireActual('@game/targeting');
  return {
    ...actual,
    pickBiasedRandom: jest.fn(),
  };
});

jest.mock('@game/aces', () => {
  const actual = jest.requireActual('@game/aces');
  return {
    ...actual,
    resolveAce: jest.fn(),
  };
});

jest.mock('@content/packLoader', () => {
  const actual = jest.requireActual('@content/packLoader');
  return {
    ...actual,
    findForfeit: jest.fn(actual.findForfeit),
  };
});

import { resolveAce } from '@game/aces';
import { findForfeit } from '@content/packLoader';
import { useGameStore } from '@game/gameStore';
import { sessionStore } from '@game/persistence';
import { pickBiasedRandom } from '@game/targeting';
import { makeCard, makeDraft, makePlayer, seedGameState } from '@game/__tests__/storeTestUtils';
import type { GameState } from '@game/types';

const mockedSessionStore = sessionStore as jest.Mocked<typeof sessionStore>;
const mockedPickBiasedRandom = pickBiasedRandom as jest.MockedFunction<typeof pickBiasedRandom>;
const mockedResolveAce = resolveAce as jest.MockedFunction<typeof resolveAce>;
const mockedFindForfeit = findForfeit as jest.MockedFunction<typeof findForfeit>;

describe('useGameStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSessionStore.write.mockResolvedValue(undefined);
    mockedSessionStore.clear.mockResolvedValue(undefined);
    mockedFindForfeit.mockImplementation(jest.requireActual('@content/packLoader').findForfeit);
    seedGameState({});
  });

  it('startGame initialises mode, roster, and deck', () => {
    useGameStore
      .getState()
      .startGame('diablo', [makeDraft('Ana'), makeDraft('Beto'), makeDraft('Cami')]);
    const state = useGameStore.getState();
    expect(state.mode).toBe('diablo');
    expect(state.players).toHaveLength(3);
    expect(state.deck).toHaveLength(52);
    expect(state.drawnCard).toBeNull();
    expect(mockedSessionStore.write).toHaveBeenCalledTimes(1);
  });

  it('drawNextCard returns null when there is no drawer', () => {
    seedGameState({
      players: [],
      currentPlayerIndex: 0,
      deck: [makeCard('hearts-2', 'hearts', 2)],
    });
    expect(useGameStore.getState().drawNextCard()).toBeNull();
    expect(mockedSessionStore.write).not.toHaveBeenCalled();
  });

  it('drawNextCard returns null when deck is empty and clears stale drawn card', () => {
    seedGameState({
      players: [makePlayer('drawer')],
      currentPlayerIndex: 0,
      deck: [],
      drawnCard: makeCard('old', 'clubs', 4),
    });
    expect(useGameStore.getState().drawNextCard()).toBeNull();
    expect(useGameStore.getState().drawnCard).toBeNull();
    expect(mockedSessionStore.write).toHaveBeenCalledTimes(1);
  });

  it('drawNextCard resolves biased templates using pickBiasedRandom', () => {
    const drawer = makePlayer('drawer', { name: 'Drawer Name' });
    const candidate = makePlayer('target', { name: 'Target Name' });
    seedGameState({
      mode: 'tradicional',
      players: [drawer, candidate],
      currentPlayerIndex: 0,
      deck: [makeCard('hearts-2', 'hearts', 2)],
    });
    mockedPickBiasedRandom.mockReturnValue(candidate);

    const resolved = useGameStore.getState().drawNextCard();

    expect(mockedPickBiasedRandom).toHaveBeenCalledWith(drawer, [drawer, candidate], 'any');
    expect(resolved?.penaltyAmount).toBe(2);
    expect(resolved?.biasedRandomPlayer?.id).toBe('target');
    expect(resolved?.renderedText).toContain('Target Name');
    expect(resolved?.renderedText).toContain('Drawer Name');
    expect(useGameStore.getState().drawnCard?.id).toBe('hearts-2');
    expect(useGameStore.getState().deck).toEqual([]);
    expect(mockedSessionStore.write).toHaveBeenCalledTimes(1);
  });

  it('drawNextCard skips pickBiasedRandom for templates without the token', () => {
    seedGameState({
      mode: 'tradicional',
      players: [makePlayer('drawer'), makePlayer('other')],
      currentPlayerIndex: 0,
      deck: [makeCard('clubs-2', 'clubs', 2)],
    });

    const resolved = useGameStore.getState().drawNextCard();

    expect(mockedPickBiasedRandom).not.toHaveBeenCalled();
    expect(resolved?.biasedRandomPlayer).toBeNull();
  });

  it('drawNextCard bubbles forfeit lookup errors before mutating state', () => {
    seedGameState({
      mode: 'tradicional',
      players: [makePlayer('drawer')],
      currentPlayerIndex: 0,
      deck: [makeCard('hearts-2', 'hearts', 2)],
    });
    mockedFindForfeit.mockImplementationOnce(() => {
      throw new Error('broken-pack');
    });

    expect(() => useGameStore.getState().drawNextCard()).toThrow('broken-pack');
    expect(useGameStore.getState().deck).toHaveLength(1);
    expect(useGameStore.getState().drawnCard).toBeNull();
    expect(mockedSessionStore.write).not.toHaveBeenCalled();
  });

  it('applyPenaltiesTo updates active players and queues shot takeover modal', () => {
    seedGameState({
      players: [
        makePlayer('active', {
          threshold: 5,
          penaltiesSinceLastShot: 4,
          rawPenalties: 2,
          shotsTaken: 1,
          status: 'active',
        }),
        makePlayer('removed', {
          threshold: 5,
          penaltiesSinceLastShot: 4,
          rawPenalties: 10,
          status: 'removed',
        }),
      ],
    });

    useGameStore.getState().applyPenaltiesTo({ active: 3, removed: 3 });

    const state = useGameStore.getState();
    const active = state.players.find((p) => p.id === 'active')!;
    const removed = state.players.find((p) => p.id === 'removed')!;
    expect(active.rawPenalties).toBe(5);
    expect(active.shotsTaken).toBe(2);
    expect(active.penaltiesSinceLastShot).toBe(2);
    expect(removed.rawPenalties).toBe(10);
    expect(state.pendingShotQueue).toEqual([{ playerId: 'active', shots: 1 }]);
    expect(state.pendingModal).toEqual({ kind: 'shotTakeover', playerId: 'active', shots: 1 });
    expect(mockedSessionStore.write).toHaveBeenCalledTimes(1);
  });

  it('applyPenaltiesTo keeps existing modal when no new shots are queued', () => {
    seedGameState({
      players: [makePlayer('p1', { threshold: 20, penaltiesSinceLastShot: 1 })],
      pendingModal: { kind: 'vote' },
    });

    useGameStore.getState().applyPenaltiesTo({ p1: 2 });

    expect(useGameStore.getState().pendingModal).toEqual({ kind: 'vote' });
    expect(useGameStore.getState().pendingShotQueue).toEqual([]);
  });

  it('resolveCurrentAce does nothing when current card is not an Ace', () => {
    seedGameState({
      players: [makePlayer('drawer')],
      currentPlayerIndex: 0,
      drawnCard: makeCard('spades-9', 'spades', 9),
    });

    useGameStore.getState().resolveCurrentAce();

    expect(mockedResolveAce).not.toHaveBeenCalled();
  });

  it('resolveCurrentAce applies aggregated ace assignments', () => {
    const drawer = makePlayer('drawer', { threshold: 10, penaltiesSinceLastShot: 0 });
    const target = makePlayer('target', { threshold: 2, penaltiesSinceLastShot: 1, shotsTaken: 0 });
    seedGameState({
      players: [drawer, target],
      currentPlayerIndex: 0,
      drawnCard: makeCard('hearts-A', 'hearts', 'A'),
    });
    mockedResolveAce.mockReturnValue([
      { playerId: 'drawer', penalties: 3, reason: 'x' },
      { playerId: 'target', penalties: 1, reason: 'y' },
      { playerId: 'target', penalties: 3, reason: 'z' },
    ]);

    useGameStore.getState().resolveCurrentAce();

    expect(mockedResolveAce).toHaveBeenCalledWith('hearts', drawer, [drawer, target]);
    const state = useGameStore.getState();
    expect(state.players.find((p) => p.id === 'drawer')?.rawPenalties).toBe(3);
    expect(state.players.find((p) => p.id === 'target')?.rawPenalties).toBe(4);
    expect(state.pendingShotQueue).toEqual([{ playerId: 'target', shots: 2 }]);
  });

  it('advanceTurn no-ops when roster is empty', () => {
    seedGameState({ players: [], currentPlayerIndex: 0, drawnCard: makeCard('x', 'clubs', 2) });
    useGameStore.getState().advanceTurn();
    expect(useGameStore.getState().currentPlayerIndex).toBe(0);
    expect(mockedSessionStore.write).not.toHaveBeenCalled();
  });

  it('advanceTurn moves to next active player and clears modal when queue is empty', () => {
    seedGameState({
      players: [
        makePlayer('a', { status: 'active' }),
        makePlayer('b', { status: 'removed' }),
        makePlayer('c', { status: 'active' }),
      ],
      currentPlayerIndex: 0,
      drawnCard: makeCard('c2', 'clubs', 2),
      pendingModal: { kind: 'vote' },
      pendingShotQueue: [],
    });

    useGameStore.getState().advanceTurn();

    const state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(2);
    expect(state.drawnCard).toBeNull();
    expect(state.pendingModal).toBeNull();
  });

  it('advanceTurn keeps active shot modal while queue remains', () => {
    seedGameState({
      players: [makePlayer('a'), makePlayer('b')],
      currentPlayerIndex: 0,
      pendingShotQueue: [{ playerId: 'a', shots: 1 }],
      pendingModal: { kind: 'shotTakeover', playerId: 'a', shots: 1 },
    });
    useGameStore.getState().advanceTurn();
    expect(useGameStore.getState().pendingModal).toEqual({
      kind: 'shotTakeover',
      playerId: 'a',
      shots: 1,
    });
  });

  it('dismissShotTakeover advances queue and eventually closes the modal', () => {
    seedGameState({
      players: [makePlayer('a'), makePlayer('b')],
      pendingShotQueue: [
        { playerId: 'a', shots: 1 },
        { playerId: 'b', shots: 2 },
      ],
      pendingModal: { kind: 'shotTakeover', playerId: 'a', shots: 1 },
    });

    useGameStore.getState().dismissShotTakeover();
    expect(useGameStore.getState().pendingShotQueue).toEqual([{ playerId: 'b', shots: 2 }]);
    expect(useGameStore.getState().pendingModal).toEqual({
      kind: 'shotTakeover',
      playerId: 'b',
      shots: 2,
    });

    useGameStore.getState().dismissShotTakeover();
    expect(useGameStore.getState().pendingShotQueue).toEqual([]);
    expect(useGameStore.getState().pendingModal).toBeNull();
  });

  it('addPlayer inserts right after current drawer', () => {
    seedGameState({
      players: [makePlayer('a'), makePlayer('b'), makePlayer('c')],
      currentPlayerIndex: 1,
    });

    useGameStore.getState().addPlayer(makeDraft('newbie'));

    const names = useGameStore.getState().players.map((p) => p.name);
    expect(names[2]).toBe('newbie');
    expect(useGameStore.getState().players).toHaveLength(4);
  });

  it('addPlayer flushes back-owed shots after threshold rebalance', () => {
    seedGameState({
      players: [
        makePlayer('p1', {
          abv: 0.01,
          threshold: 3,
          penaltiesSinceLastShot: 2,
          shotsTaken: 0,
        }),
        makePlayer('p2', { abv: 0.01, threshold: 3 }),
      ],
      currentPlayerIndex: 0,
    });

    useGameStore.getState().addPlayer({
      name: 'P3',
      abv: 0.01,
      difficulty: 'tradicional',
      gender: 'woman',
      attractedTo: ['man'],
    });

    const updated = useGameStore.getState().players.find((p) => p.id === 'p1')!;
    expect(updated.shotsTaken).toBe(1);
    expect(updated.penaltiesSinceLastShot).toBe(0);
    expect(useGameStore.getState().pendingShotQueue[0]).toEqual({ playerId: 'p1', shots: 1 });
  });

  it('removePlayer removes roster entry, tracks removed list, and rotates index', () => {
    seedGameState({
      players: [makePlayer('a'), makePlayer('b'), makePlayer('c')],
      currentPlayerIndex: 1,
      removedPlayers: [],
    });

    useGameStore.getState().removePlayer('b');

    const state = useGameStore.getState();
    expect(state.players.map((p) => p.id)).toEqual(['a', 'c']);
    expect(state.removedPlayers).toHaveLength(1);
    expect(state.removedPlayers[0]?.id).toBe('b');
    expect(state.removedPlayers[0]?.status).toBe('removed');
    expect(state.currentPlayerIndex).toBe(0);
  });

  it('removePlayer no-ops for unknown ids', () => {
    seedGameState({
      players: [makePlayer('a'), makePlayer('b')],
      currentPlayerIndex: 1,
    });
    const before = useGameStore.getState();
    useGameStore.getState().removePlayer('missing');
    expect(useGameStore.getState().players).toEqual(before.players);
    expect(mockedSessionStore.write).not.toHaveBeenCalled();
  });

  it('updatePlayer recalculates threshold and queues overdue shots', () => {
    seedGameState({
      players: [
        makePlayer('p1', {
          abv: 0.01,
          difficulty: 'tradicional',
          threshold: 3,
          penaltiesSinceLastShot: 4,
          shotsTaken: 1,
        }),
        makePlayer('p2', { abv: 0.01 }),
      ],
      pendingShotQueue: [],
      pendingModal: null,
    });

    useGameStore.getState().updatePlayer('p1', { difficulty: 'muerte' });

    const state = useGameStore.getState();
    const updated = state.players.find((p) => p.id === 'p1')!;
    expect(updated.threshold).toBe(1);
    expect(updated.shotsTaken).toBe(5);
    expect(updated.penaltiesSinceLastShot).toBe(0);
    expect(state.pendingShotQueue[0]).toEqual({ playerId: 'p1', shots: 4 });
    expect(state.pendingModal).toEqual({ kind: 'shotTakeover', playerId: 'p1', shots: 4 });
  });

  it('updatePlayer preserves modal when no overdue shot is created', () => {
    seedGameState({
      players: [makePlayer('p1', { penaltiesSinceLastShot: 1 }), makePlayer('p2')],
      pendingModal: { kind: 'vote' },
    });

    useGameStore.getState().updatePlayer('p1', { name: 'Renamed' });

    expect(useGameStore.getState().pendingModal).toEqual({ kind: 'vote' });
  });

  it('hydrateFromSnapshot replaces state payload', () => {
    const snapshot: GameState = {
      mode: 'diablo',
      players: [makePlayer('one')],
      removedPlayers: [makePlayer('gone', { status: 'removed' })],
      currentPlayerIndex: 0,
      deck: [makeCard('clubs-5', 'clubs', 5)],
      drawnCard: makeCard('clubs-2', 'clubs', 2),
      history: [],
      pendingModal: { kind: 'vote' },
      pendingShotQueue: [{ playerId: 'one', shots: 2 }],
    };
    useGameStore.getState().hydrateFromSnapshot(snapshot);
    expect(useGameStore.getState().mode).toBe('diablo');
    expect(useGameStore.getState().pendingModal).toEqual({ kind: 'vote' });
    expect(useGameStore.getState().deck).toHaveLength(1);
  });

  it('endGame clears pending modal only', () => {
    seedGameState({
      players: [makePlayer('a')],
      pendingModal: { kind: 'vote' },
      drawnCard: makeCard('clubs-6', 'clubs', 6),
    });
    useGameStore.getState().endGame();
    expect(useGameStore.getState().pendingModal).toBeNull();
    expect(useGameStore.getState().drawnCard?.id).toBe('clubs-6');
  });

  it('reset returns to initial state and clears persisted session', () => {
    seedGameState({
      mode: 'diablo',
      players: [makePlayer('a')],
      removedPlayers: [makePlayer('r', { status: 'removed' })],
      currentPlayerIndex: 1,
      deck: [makeCard('x', 'hearts', 5)],
      drawnCard: makeCard('y', 'spades', 8),
      pendingModal: { kind: 'vote' },
      pendingShotQueue: [{ playerId: 'a', shots: 3 }],
    });

    useGameStore.getState().reset();

    const state = useGameStore.getState();
    expect(state.mode).toBe('tradicional');
    expect(state.players).toEqual([]);
    expect(state.removedPlayers).toEqual([]);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.deck).toEqual([]);
    expect(state.drawnCard).toBeNull();
    expect(state.pendingModal).toBeNull();
    expect(state.pendingShotQueue).toEqual([]);
    expect(mockedSessionStore.clear).toHaveBeenCalledTimes(1);
  });
});
