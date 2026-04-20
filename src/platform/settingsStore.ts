import { create } from 'zustand';
import { settingsStore, DEFAULT_SETTINGS, type SettingsState } from '@game/persistence';

type State = SettingsState & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSoundEnabled: (value: boolean) => Promise<void>;
  setHapticsEnabled: (value: boolean) => Promise<void>;
};

export const useSettings = create<State>((set, get) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: async () => {
    const stored = await settingsStore.read();
    set({ ...stored, hydrated: true });
  },
  setSoundEnabled: async (value) => {
    const next: SettingsState = {
      soundEnabled: value,
      hapticsEnabled: get().hapticsEnabled,
    };
    await settingsStore.write(next);
    set({ ...next });
  },
  setHapticsEnabled: async (value) => {
    const next: SettingsState = {
      soundEnabled: get().soundEnabled,
      hapticsEnabled: value,
    };
    await settingsStore.write(next);
    set({ ...next });
  },
}));

export function isSoundEnabled(): boolean {
  return useSettings.getState().soundEnabled;
}

export function isHapticsEnabled(): boolean {
  return useSettings.getState().hapticsEnabled;
}
