type MockedUnlocksStore = {
  read: jest.Mock<Promise<{ diablo: boolean }>, []>;
  write: jest.Mock<Promise<void>, [{ diablo: boolean }]>;
};

async function loadIapModule(options: {
  os: 'web' | 'ios' | 'android';
  iapModuleFactory?: () => {
    initConnection?: jest.Mock<Promise<unknown>, []>;
    requestPurchase?: jest.Mock<Promise<unknown>, [unknown]>;
  };
}) {
  jest.resetModules();

  const unlocksStore: MockedUnlocksStore = {
    read: jest.fn().mockResolvedValue({ diablo: false }),
    write: jest.fn().mockResolvedValue(undefined),
  };

  jest.doMock('@game/persistence', () => ({
    __esModule: true,
    unlocksStore,
  }));

  jest.doMock('react-native', () => ({
    Platform: { OS: options.os },
  }));

  if (options.iapModuleFactory) {
    jest.doMock('react-native-iap', options.iapModuleFactory, { virtual: true });
  } else {
    jest.doMock(
      'react-native-iap',
      () => {
        throw new Error('module unavailable');
      },
      { virtual: true },
    );
  }

  const iapModule = await import('@platform/iap');
  return { ...iapModule, unlocksStore };
}

describe('iap facade', () => {
  it('init skips native bootstrap on web', async () => {
    const initConnection = jest.fn();
    const { iap } = await loadIapModule({
      os: 'web',
      iapModuleFactory: () => ({ initConnection }),
    });

    await expect(iap.init()).resolves.toBeUndefined();
    expect(initConnection).not.toHaveBeenCalled();
  });

  it('init starts native connection when IAP module exists', async () => {
    const initConnection = jest.fn().mockResolvedValue(true);
    const { iap } = await loadIapModule({
      os: 'ios',
      iapModuleFactory: () => ({ initConnection }),
    });

    await iap.init();
    expect(initConnection).toHaveBeenCalledTimes(1);
  });

  it('init swallows native connection failures', async () => {
    const initConnection = jest.fn().mockRejectedValue(new Error('init failed'));
    const { iap } = await loadIapModule({
      os: 'android',
      iapModuleFactory: () => ({ initConnection }),
    });

    await expect(iap.init()).resolves.toBeUndefined();
  });

  it('loadUnlocks returns persisted unlock state', async () => {
    const { iap, unlocksStore } = await loadIapModule({ os: 'web' });
    unlocksStore.read.mockResolvedValueOnce({ diablo: true });

    await expect(iap.loadUnlocks()).resolves.toEqual({ diablo: true });
    expect(unlocksStore.read).toHaveBeenCalledTimes(1);
  });

  it('purchaseDiablo returns web fallback text on web', async () => {
    const { iap, unlocksStore } = await loadIapModule({ os: 'web' });

    await expect(iap.purchaseDiablo()).resolves.toEqual({
      success: false,
      error: 'Web IAP coming soon — Tradicional is free and fully playable.',
    });
    expect(unlocksStore.write).not.toHaveBeenCalled();
  });

  it('purchaseDiablo reports unavailable native module', async () => {
    const { iap, unlocksStore } = await loadIapModule({ os: 'ios' });

    await expect(iap.purchaseDiablo()).resolves.toEqual({
      success: false,
      error: 'IAP module unavailable on this build. Run in a dev client.',
    });
    expect(unlocksStore.write).not.toHaveBeenCalled();
  });

  it('purchaseDiablo persists unlock when purchase succeeds', async () => {
    const requestPurchase = jest.fn().mockResolvedValue({ transactionId: 'tx' });
    const { iap, unlocksStore } = await loadIapModule({
      os: 'ios',
      iapModuleFactory: () => ({ requestPurchase }),
    });

    await expect(iap.purchaseDiablo()).resolves.toEqual({ success: true });
    expect(requestPurchase).toHaveBeenCalledWith({
      sku: 'com.picante.diablo',
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });
    expect(unlocksStore.write).toHaveBeenCalledWith({ diablo: true });
  });

  it('purchaseDiablo returns an error when purchase does not complete', async () => {
    const requestPurchase = jest.fn().mockResolvedValue(null);
    const { iap, unlocksStore } = await loadIapModule({
      os: 'android',
      iapModuleFactory: () => ({ requestPurchase }),
    });

    await expect(iap.purchaseDiablo()).resolves.toEqual({
      success: false,
      error: 'Purchase did not complete.',
    });
    expect(unlocksStore.write).not.toHaveBeenCalled();
  });

  it('purchaseDiablo maps thrown native errors into the response', async () => {
    const requestPurchase = jest.fn().mockRejectedValue(new Error('purchase exploded'));
    const { iap, unlocksStore } = await loadIapModule({
      os: 'android',
      iapModuleFactory: () => ({ requestPurchase }),
    });

    await expect(iap.purchaseDiablo()).resolves.toEqual({
      success: false,
      error: 'purchase exploded',
    });
    expect(unlocksStore.write).not.toHaveBeenCalled();
  });

  it('restorePurchases reuses persisted unlocks', async () => {
    const { iap, unlocksStore } = await loadIapModule({ os: 'ios' });
    unlocksStore.read.mockResolvedValueOnce({ diablo: true });

    await expect(iap.restorePurchases()).resolves.toEqual({ diablo: true });
    expect(unlocksStore.read).toHaveBeenCalledTimes(1);
  });
});
