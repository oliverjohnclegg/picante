jest.mock('@game/persistence', () => ({
  __esModule: true,
  DEFAULT_SETTINGS: { soundEnabled: true, hapticsEnabled: true },
  settingsStore: {
    read: jest.fn(),
    write: jest.fn(),
  },
}));

import { settingsStore } from '@game/persistence';
import { useSettings, isSoundEnabled, isHapticsEnabled } from '@platform/settingsStore';

const mockedSettingsStore = settingsStore as jest.Mocked<typeof settingsStore>;

describe('useSettings store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettings.setState({ soundEnabled: true, hapticsEnabled: true, hydrated: false });
  });

  it('hydrates from persisted state', async () => {
    mockedSettingsStore.read.mockResolvedValueOnce({
      soundEnabled: false,
      hapticsEnabled: false,
    });
    await useSettings.getState().hydrate();
    expect(useSettings.getState().soundEnabled).toBe(false);
    expect(useSettings.getState().hapticsEnabled).toBe(false);
    expect(useSettings.getState().hydrated).toBe(true);
  });

  it('setSoundEnabled persists and updates in-memory state without touching haptics', async () => {
    useSettings.setState({ soundEnabled: true, hapticsEnabled: false, hydrated: true });
    await useSettings.getState().setSoundEnabled(false);
    expect(mockedSettingsStore.write).toHaveBeenCalledWith({
      soundEnabled: false,
      hapticsEnabled: false,
    });
    expect(useSettings.getState().soundEnabled).toBe(false);
    expect(useSettings.getState().hapticsEnabled).toBe(false);
  });

  it('setHapticsEnabled persists and updates in-memory state without touching sound', async () => {
    useSettings.setState({ soundEnabled: false, hapticsEnabled: true, hydrated: true });
    await useSettings.getState().setHapticsEnabled(false);
    expect(mockedSettingsStore.write).toHaveBeenCalledWith({
      soundEnabled: false,
      hapticsEnabled: false,
    });
    expect(useSettings.getState().hapticsEnabled).toBe(false);
    expect(useSettings.getState().soundEnabled).toBe(false);
  });

  it('isSoundEnabled / isHapticsEnabled read from current state', () => {
    useSettings.setState({ soundEnabled: false, hapticsEnabled: true, hydrated: true });
    expect(isSoundEnabled()).toBe(false);
    expect(isHapticsEnabled()).toBe(true);
  });
});
