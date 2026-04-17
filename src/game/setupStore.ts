import { create } from 'zustand';
import type { GameMode } from '@game/types';
import type { PlayerDraft } from '@game/playerFactory';

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 16;

type State = {
  mode: GameMode;
  drafts: PlayerDraft[];
  setMode: (mode: GameMode) => void;
  addDraft: (draft: PlayerDraft) => void;
  updateDraft: (index: number, updates: Partial<PlayerDraft>) => void;
  removeDraft: (index: number) => void;
  reset: () => void;
};

const emptyDrafts: PlayerDraft[] = [];

export const useSetupStore = create<State>((set) => ({
  mode: 'tradicional',
  drafts: emptyDrafts,
  setMode: (mode) => set({ mode }),
  addDraft: (draft) =>
    set((state) => {
      if (state.drafts.length >= MAX_PLAYERS) return state;
      return { drafts: [...state.drafts, draft] };
    }),
  updateDraft: (index, updates) =>
    set((state) => ({
      drafts: state.drafts.map((d, i) => (i === index ? { ...d, ...updates } : d)),
    })),
  removeDraft: (index) => set((state) => ({ drafts: state.drafts.filter((_, i) => i !== index) })),
  reset: () => set({ mode: 'tradicional', drafts: emptyDrafts }),
}));
