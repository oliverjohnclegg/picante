type SoundMock = {
  setPositionAsync: jest.Mock<Promise<void>, [number]>;
  playAsync: jest.Mock<Promise<void>, []>;
  unloadAsync: jest.Mock<Promise<void>, []>;
  replayAsync: jest.Mock<Promise<void>, []>;
};

async function loadSfxModule(options: {
  os: 'web' | 'ios' | 'android';
  soundEnabled?: boolean;
  createAsyncImpl?: jest.Mock<Promise<{ sound: SoundMock }>, [unknown, unknown]>;
}) {
  jest.resetModules();

  jest.doMock('react-native', () => ({
    Platform: { OS: options.os },
  }));

  jest.doMock('@platform/settingsStore', () => ({
    isSoundEnabled: () => options.soundEnabled ?? true,
    isHapticsEnabled: () => true,
  }));

  const soundInstance: SoundMock = {
    setPositionAsync: jest.fn().mockResolvedValue(undefined),
    playAsync: jest.fn().mockResolvedValue(undefined),
    unloadAsync: jest.fn().mockResolvedValue(undefined),
    replayAsync: jest.fn().mockResolvedValue(undefined),
  };

  const createAsync =
    options.createAsyncImpl ??
    (jest.fn() as unknown as jest.Mock<Promise<{ sound: SoundMock }>, [unknown, unknown]>);
  if (!options.createAsyncImpl) {
    createAsync.mockResolvedValue({ sound: soundInstance });
  }

  jest.doMock(
    'expo-av',
    () => ({
      Audio: {
        Sound: { createAsync },
      },
    }),
    { virtual: true },
  );

  const mod = await import('@platform/sfx');
  return { ...mod, createAsync, soundInstance };
}

describe('sfx facade', () => {
  it('is a no-op on web', async () => {
    const { sfx, createAsync } = await loadSfxModule({ os: 'web' });
    await sfx.play('card_flip');
    expect(createAsync).not.toHaveBeenCalled();
  });

  it('is a no-op when sound is disabled in settings', async () => {
    const { sfx, createAsync } = await loadSfxModule({ os: 'ios', soundEnabled: false });
    await sfx.play('card_flip');
    expect(createAsync).not.toHaveBeenCalled();
  });

  it('loads and plays a sound the first time', async () => {
    const { sfx, createAsync, soundInstance } = await loadSfxModule({ os: 'ios' });
    await sfx.play('card_flip');
    expect(createAsync).toHaveBeenCalledTimes(1);
    expect(soundInstance.playAsync).toHaveBeenCalledTimes(1);
  });

  it('caches loaded sounds and rewinds on replay', async () => {
    const { sfx, createAsync, soundInstance } = await loadSfxModule({ os: 'ios' });
    await sfx.play('card_flip');
    await sfx.play('card_flip');
    expect(createAsync).toHaveBeenCalledTimes(1);
    expect(soundInstance.setPositionAsync).toHaveBeenCalledTimes(2);
    expect(soundInstance.playAsync).toHaveBeenCalledTimes(2);
  });

  it('swallows load failures silently', async () => {
    const failing = jest
      .fn<Promise<{ sound: SoundMock }>, [unknown, unknown]>()
      .mockRejectedValue(new Error('nope'));
    const { sfx } = await loadSfxModule({ os: 'ios', createAsyncImpl: failing });
    await expect(sfx.play('ace_sting')).resolves.toBeUndefined();
  });

  it('unloadAll unloads cached sounds', async () => {
    const { sfx, soundInstance } = await loadSfxModule({ os: 'ios' });
    await sfx.play('card_flip');
    await sfx.unloadAll();
    expect(soundInstance.unloadAsync).toHaveBeenCalledTimes(1);
  });
});
