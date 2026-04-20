import { create } from 'zustand';
import { unlocksStore, DEFAULT_UNLOCKS, type UnlocksState } from '@game/persistence';

type State = UnlocksState & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setDiablo: (value: boolean) => Promise<void>;
};

export const useUnlocks = create<State>((set) => ({
  ...DEFAULT_UNLOCKS,
  hydrated: false,
  hydrate: async () => {
    const stored = await unlocksStore.read();
    set({ ...stored, hydrated: true });
  },
  setDiablo: async (value) => {
    const next: UnlocksState = { diablo: value };
    await unlocksStore.write(next);
    set({ ...next });
  },
}));
