import type { Card, GameState, Player } from '@game/types';
import type { PlayerDraft } from '@game/playerFactory';
import { useGameStore } from '@game/gameStore';

export const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

export const makeDraft = (name: string): PlayerDraft => ({
  name,
  abv: 0.2,
  difficulty: 'tradicional',
  gender: 'man',
  attractedTo: ['woman'],
});

export const makePlayer = (id: string, overrides: Partial<Player> = {}): Player => ({
  id,
  name: id,
  abv: 0.2,
  difficulty: 'tradicional',
  gender: 'man',
  attractedTo: ['woman'],
  rawPenalties: 0,
  penaltiesSinceLastShot: 0,
  shotsTaken: 0,
  threshold: 6,
  status: 'active',
  ...overrides,
});

export const makeCard = (id: string, suit: Card['suit'], value: Card['value']): Card => ({
  id,
  suit,
  value,
});

export const seedGameState = (state: Partial<GameState>) => {
  useGameStore.setState({
    mode: 'tradicional',
    players: [],
    removedPlayers: [],
    currentPlayerIndex: 0,
    deck: [],
    drawnCard: null,
    history: [],
    pendingModal: null,
    pendingShotQueue: [],
    ...state,
  });
};
