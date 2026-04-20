jest.mock('@game/persistence', () => ({
  __esModule: true,
  DEFAULT_UNLOCKS: { diablo: true },
  unlocksStore: {
    read: jest.fn(),
    write: jest.fn(),
  },
}));

import { unlocksStore } from '@game/persistence';
import { useUnlocks } from '@platform/unlocksStore';

const mockedUnlocksStore = unlocksStore as jest.Mocked<typeof unlocksStore>;

describe('useUnlocks store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUnlocks.setState({ diablo: true, hydrated: false });
  });

  it('hydrates from persisted state and marks hydrated', async () => {
    mockedUnlocksStore.read.mockResolvedValueOnce({ diablo: false });
    await useUnlocks.getState().hydrate();
    expect(useUnlocks.getState().hydrated).toBe(true);
    expect(useUnlocks.getState().diablo).toBe(true);
  });

  it('setDiablo persists and updates in-memory state', async () => {
    mockedUnlocksStore.write.mockResolvedValueOnce(undefined);
    await useUnlocks.getState().setDiablo(false);
    expect(mockedUnlocksStore.write).toHaveBeenCalledWith({ diablo: false });
    expect(useUnlocks.getState().diablo).toBe(false);
  });
});
