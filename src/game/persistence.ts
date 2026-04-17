import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState } from '@game/types';

const SESSION_KEY = '@picante/session/v1';
const UNLOCKS_KEY = '@picante/unlocks/v1';
const SETTINGS_KEY = '@picante/settings/v1';
const AGE_GATE_KEY = '@picante/age-gate/v1';

export type UnlocksState = {
  diablo: boolean;
};

export type SettingsState = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
};

export const DEFAULT_UNLOCKS: UnlocksState = { diablo: false };
export const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: true,
  hapticsEnabled: true,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // swallow — persistence is best-effort; never crash gameplay
  }
}

export const sessionStore = {
  read: () => readJson<GameState | null>(SESSION_KEY, null),
  write: (state: GameState) => writeJson(SESSION_KEY, state),
  clear: () => AsyncStorage.removeItem(SESSION_KEY).catch(() => undefined),
};

export const unlocksStore = {
  read: () => readJson<UnlocksState>(UNLOCKS_KEY, DEFAULT_UNLOCKS),
  write: (state: UnlocksState) => writeJson(UNLOCKS_KEY, state),
};

export const settingsStore = {
  read: () => readJson<SettingsState>(SETTINGS_KEY, DEFAULT_SETTINGS),
  write: (state: SettingsState) => writeJson(SETTINGS_KEY, state),
};

export const ageGateStore = {
  read: () => readJson<{ confirmed: boolean }>(AGE_GATE_KEY, { confirmed: false }),
  write: (state: { confirmed: boolean }) => writeJson(AGE_GATE_KEY, state),
};
