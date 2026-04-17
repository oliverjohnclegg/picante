import { create } from 'zustand';
import type { Card, ForfeitTemplate, GameMode, GameState, Player, PlayerId } from '@game/types';
import { applyPenalties, computeThreshold, recomputePlayerThresholds } from '@game/penaltyModel';
import { buildShuffledDeck, drawCard } from '@game/deck';
import { resolveAce } from '@game/aces';
import { findForfeit, getPack } from '@content/packLoader';
import { pickBiasedRandom } from '@game/targeting';
import { renderForfeitText, resolvePenalty } from '@game/forfeitRenderer';
import { makePlayer, type PlayerDraft } from '@game/playerFactory';
import { sessionStore } from '@game/persistence';

export type ResolvedForfeit = {
  template: ForfeitTemplate;
  renderedText: string;
  penaltyAmount: number;
  biasedRandomPlayer: Player | null;
};

type Actions = {
  startGame: (mode: GameMode, drafts: PlayerDraft[]) => void;
  drawNextCard: () => ResolvedForfeit | null;
  applyPenaltiesTo: (assignments: Record<PlayerId, number>) => void;
  resolveCurrentAce: () => void;
  advanceTurn: () => void;
  dismissShotTakeover: () => void;
  addPlayer: (draft: PlayerDraft) => void;
  removePlayer: (id: PlayerId) => void;
  updatePlayer: (
    id: PlayerId,
    updates: Partial<Pick<Player, 'name' | 'abv' | 'difficulty' | 'gender' | 'attractedTo'>>,
  ) => void;
  hydrateFromSnapshot: (state: GameState) => void;
  endGame: () => void;
  reset: () => void;
};

export type GameStore = GameState & Actions;

const INITIAL_STATE: GameState = {
  mode: 'tradicional',
  players: [],
  removedPlayers: [],
  currentPlayerIndex: 0,
  deck: [],
  drawnCard: null,
  history: [],
  pendingModal: null,
  pendingShotQueue: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,

  startGame: (mode, drafts) => {
    const numPlayers = drafts.length;
    const players = drafts.map((d) => makePlayer(d, numPlayers));
    set({
      ...INITIAL_STATE,
      mode,
      players,
      deck: buildShuffledDeck(),
    });
    persistSnapshot();
  },

  drawNextCard: () => {
    const state = get();
    const drawerIndex = state.currentPlayerIndex;
    const drawer = state.players[drawerIndex];
    if (!drawer) return null;
    const { card, remaining } = drawCard(state.deck);
    if (!card) {
      set({ drawnCard: null });
      persistSnapshot();
      return null;
    }

    const pack = getPack(state.mode);
    const template = findForfeit(pack, card.suit, card.value);
    const biasedRandomPlayer = needsBiased(template)
      ? pickBiasedRandom(drawer, state.players, template.targetingMode)
      : null;
    const renderedText = renderForfeitText(template, {
      drawer,
      biasedRandom: biasedRandomPlayer,
    });
    const penaltyAmount = resolvePenalty(card.value, template.penalty);

    set({ drawnCard: card, deck: remaining });
    persistSnapshot();

    return {
      template,
      renderedText,
      penaltyAmount,
      biasedRandomPlayer,
    };
  },

  applyPenaltiesTo: (assignments) => {
    const { players } = get();
    const queue: Array<{ playerId: PlayerId; shots: number }> = [];
    const next = players.map((p) => {
      const delta = assignments[p.id] ?? 0;
      if (delta <= 0 || p.status !== 'active') return p;
      const { player, pendingShots } = applyPenalties(p, delta);
      if (pendingShots > 0) queue.push({ playerId: p.id, shots: pendingShots });
      return player;
    });
    set({
      players: next,
      pendingShotQueue: [...get().pendingShotQueue, ...queue],
      pendingModal:
        queue.length > 0
          ? { kind: 'shotTakeover', playerId: queue[0]!.playerId, shots: queue[0]!.shots }
          : get().pendingModal,
    });
    persistSnapshot();
  },

  resolveCurrentAce: () => {
    const state = get();
    const card = state.drawnCard;
    if (!card || card.value !== 'A') return;
    const drawer = state.players[state.currentPlayerIndex];
    if (!drawer) return;
    const assignments = resolveAce(card.suit, drawer, state.players);
    const record: Record<PlayerId, number> = {};
    for (const a of assignments) {
      record[a.playerId] = (record[a.playerId] ?? 0) + a.penalties;
    }
    get().applyPenaltiesTo(record);
  },

  advanceTurn: () => {
    const state = get();
    if (state.players.length === 0) return;
    const next = findNextActiveIndex(state.players, state.currentPlayerIndex);
    const keepModal = state.pendingShotQueue.length > 0 ? state.pendingModal : null;
    set({
      currentPlayerIndex: next,
      drawnCard: null,
      pendingModal: keepModal,
    });
    persistSnapshot();
  },

  dismissShotTakeover: () => {
    const queue = [...get().pendingShotQueue];
    queue.shift();
    const nextModal =
      queue.length > 0
        ? {
            kind: 'shotTakeover' as const,
            playerId: queue[0]!.playerId,
            shots: queue[0]!.shots,
          }
        : null;
    set({ pendingShotQueue: queue, pendingModal: nextModal });
    persistSnapshot();
  },

  addPlayer: (draft) => {
    const state = get();
    const newPlayerCount = state.players.length + 1;
    const newPlayer = makePlayer(draft, newPlayerCount);
    const insertAt = state.currentPlayerIndex + 1;
    const nextPlayers = [...state.players];
    nextPlayers.splice(insertAt, 0, newPlayer);
    const rebalanced = recomputePlayerThresholds(nextPlayers, newPlayerCount);
    const finalised = flushBackOwedShots(rebalanced);
    set({ players: finalised.players });
    if (finalised.queue.length > 0) {
      set({
        pendingShotQueue: [...state.pendingShotQueue, ...finalised.queue],
        pendingModal: {
          kind: 'shotTakeover',
          playerId: finalised.queue[0]!.playerId,
          shots: finalised.queue[0]!.shots,
        },
      });
    }
    persistSnapshot();
  },

  removePlayer: (id) => {
    const state = get();
    const idx = state.players.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const removed = state.players[idx]!;
    const remaining = state.players.filter((p) => p.id !== id);
    const activeCount = remaining.filter((p) => p.status === 'active').length;
    const rebalanced = recomputePlayerThresholds(remaining, activeCount);
    let nextIndex = state.currentPlayerIndex;
    if (idx <= state.currentPlayerIndex) {
      nextIndex = Math.max(0, state.currentPlayerIndex - 1);
    }
    nextIndex = findNextActiveIndex(rebalanced, nextIndex - 1);
    set({
      players: rebalanced,
      removedPlayers: [...state.removedPlayers, { ...removed, status: 'removed' }],
      currentPlayerIndex: nextIndex,
    });
    persistSnapshot();
  },

  updatePlayer: (id, updates) => {
    const state = get();
    const activeCount = state.players.filter((p) => p.status === 'active').length;
    let queue: Array<{ playerId: PlayerId; shots: number }> = [];
    const next = state.players.map((p) => {
      if (p.id !== id) return p;
      const merged = { ...p, ...updates };
      const newThreshold = computeThreshold(merged.abv, activeCount, merged.difficulty);
      const rebalanced = { ...merged, threshold: newThreshold };
      if (rebalanced.penaltiesSinceLastShot >= newThreshold) {
        const overdueShots = Math.floor(rebalanced.penaltiesSinceLastShot / newThreshold);
        queue.push({ playerId: p.id, shots: overdueShots });
        return {
          ...rebalanced,
          shotsTaken: rebalanced.shotsTaken + overdueShots,
          penaltiesSinceLastShot: rebalanced.penaltiesSinceLastShot % newThreshold,
        };
      }
      return rebalanced;
    });
    set({
      players: next,
      pendingShotQueue: [...state.pendingShotQueue, ...queue],
      pendingModal:
        queue.length > 0
          ? {
              kind: 'shotTakeover',
              playerId: queue[0]!.playerId,
              shots: queue[0]!.shots,
            }
          : state.pendingModal,
    });
    persistSnapshot();
  },

  hydrateFromSnapshot: (state) => set(state),

  endGame: () => set({ pendingModal: null }),

  reset: () => {
    set({ ...INITIAL_STATE });
    sessionStore.clear();
  },
}));

function needsBiased(template: ForfeitTemplate): boolean {
  return template.text.includes('{{biasedRandom}}');
}

function findNextActiveIndex(players: Player[], currentIndex: number): number {
  if (players.length === 0) return 0;
  for (let i = 1; i <= players.length; i++) {
    const idx = (currentIndex + i) % players.length;
    if (players[idx]?.status === 'active') return idx;
  }
  return currentIndex;
}

function flushBackOwedShots(players: Player[]): {
  players: Player[];
  queue: Array<{ playerId: PlayerId; shots: number }>;
} {
  const queue: Array<{ playerId: PlayerId; shots: number }> = [];
  const next = players.map((p) => {
    if (p.status !== 'active' || p.threshold <= 0) return p;
    if (p.penaltiesSinceLastShot < p.threshold) return p;
    const overdueShots = Math.floor(p.penaltiesSinceLastShot / p.threshold);
    queue.push({ playerId: p.id, shots: overdueShots });
    return {
      ...p,
      shotsTaken: p.shotsTaken + overdueShots,
      penaltiesSinceLastShot: p.penaltiesSinceLastShot % p.threshold,
    };
  });
  return { players: next, queue };
}

async function persistSnapshot() {
  const snapshot = useGameStore.getState();
  const { startGame: _s, ...persistable } = snapshot as GameStore;
  void _s;
  await sessionStore.write(persistable as unknown as GameState);
}
