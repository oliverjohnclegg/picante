jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_SETTINGS,
  DEFAULT_UNLOCKS,
  ageGateStore,
  sessionStore,
  settingsStore,
  unlocksStore,
} from '@game/persistence';
import type { GameState } from '@game/types';

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const sessionState: GameState = {
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

describe('persistence stores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads session snapshot from storage', async () => {
    storage.getItem.mockResolvedValueOnce(JSON.stringify(sessionState));
    await expect(sessionStore.read()).resolves.toEqual(sessionState);
    expect(storage.getItem).toHaveBeenCalledWith('@picante/session/v1');
  });

  it('falls back to null session when key missing', async () => {
    storage.getItem.mockResolvedValueOnce(null);
    await expect(sessionStore.read()).resolves.toBeNull();
  });

  it('falls back when unlock payload is invalid JSON', async () => {
    storage.getItem.mockResolvedValueOnce('{broken');
    await expect(unlocksStore.read()).resolves.toEqual(DEFAULT_UNLOCKS);
  });

  it('falls back when storage read throws', async () => {
    storage.getItem.mockRejectedValueOnce(new Error('boom'));
    await expect(settingsStore.read()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('writes session snapshot JSON', async () => {
    storage.setItem.mockResolvedValueOnce(undefined);
    await sessionStore.write(sessionState);
    expect(storage.setItem).toHaveBeenCalledWith(
      '@picante/session/v1',
      JSON.stringify(sessionState),
    );
  });

  it('swallows write errors and never throws', async () => {
    storage.setItem.mockRejectedValueOnce(new Error('write failed'));
    await expect(settingsStore.write({ soundEnabled: false, hapticsEnabled: false })).resolves.toBe(
      undefined,
    );
  });

  it('writes and reads age gate state with optional dobIso', async () => {
    storage.setItem.mockResolvedValueOnce(undefined);
    await ageGateStore.write({ confirmed: true, dobIso: '1990-05-20' });
    expect(storage.setItem).toHaveBeenCalledWith(
      '@picante/age-gate/v1',
      JSON.stringify({ confirmed: true, dobIso: '1990-05-20' }),
    );

    storage.getItem.mockResolvedValueOnce(
      JSON.stringify({ confirmed: true, dobIso: '1990-05-20' }),
    );
    await expect(ageGateStore.read()).resolves.toEqual({
      confirmed: true,
      dobIso: '1990-05-20',
    });
  });

  it('clear swallows removeItem failures', async () => {
    storage.removeItem.mockRejectedValueOnce(new Error('cannot remove'));
    await expect(sessionStore.clear()).resolves.toBeUndefined();
  });
});
