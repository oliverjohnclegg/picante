async function flushMicrotasks() {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
}

type MockedUnlocksStore = {
  read: jest.Mock<Promise<{ diablo: boolean }>, []>;
  write: jest.Mock<Promise<void>, [{ diablo: boolean }]>;
};

type Listeners = {
  onPurchaseUpdated: ((purchase: unknown) => void) | null;
  onPurchaseError: ((err: unknown) => void) | null;
};

type IapMock = {
  initConnection: jest.Mock<Promise<unknown>, []>;
  endConnection: jest.Mock<Promise<void>, []>;
  purchaseUpdatedListener: jest.Mock<{ remove: () => void }, [(p: unknown) => void]>;
  purchaseErrorListener: jest.Mock<{ remove: () => void }, [(e: unknown) => void]>;
  requestPurchase: jest.Mock<Promise<unknown>, [unknown]>;
  finishTransaction: jest.Mock<Promise<void>, [unknown]>;
  restorePurchases: jest.Mock<Promise<void>, []>;
  getAvailablePurchases: jest.Mock<Promise<unknown[]>, []>;
};

async function loadIapModule(options: {
  os: 'web' | 'ios' | 'android';
  hasIapModule?: boolean;
  listeners?: Listeners;
  mockOverrides?: Partial<IapMock>;
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

  const listeners: Listeners = options.listeners ?? {
    onPurchaseUpdated: null,
    onPurchaseError: null,
  };

  let iapMock: IapMock | null = null;

  if (options.hasIapModule !== false) {
    iapMock = {
      initConnection: jest.fn().mockResolvedValue(true),
      endConnection: jest.fn().mockResolvedValue(undefined),
      purchaseUpdatedListener: jest.fn((cb) => {
        listeners.onPurchaseUpdated = cb;
        return { remove: jest.fn() };
      }),
      purchaseErrorListener: jest.fn((cb) => {
        listeners.onPurchaseError = cb;
        return { remove: jest.fn() };
      }),
      requestPurchase: jest.fn().mockResolvedValue(undefined),
      finishTransaction: jest.fn().mockResolvedValue(undefined),
      restorePurchases: jest.fn().mockResolvedValue(undefined),
      getAvailablePurchases: jest.fn().mockResolvedValue([]),
      ...options.mockOverrides,
    };
    jest.doMock('expo-iap', () => iapMock, { virtual: true });
  } else {
    jest.doMock(
      'expo-iap',
      () => {
        throw new Error('module unavailable');
      },
      { virtual: true },
    );
  }

  const iapModule = await import('@platform/iap');
  return { ...iapModule, unlocksStore, iapMock, listeners };
}

describe('iap facade', () => {
  it('init is a no-op on web', async () => {
    const { iap, iapMock } = await loadIapModule({ os: 'web' });
    await iap.init();
    expect(iapMock?.initConnection).not.toHaveBeenCalled();
  });

  it('init opens connection and registers listeners on native', async () => {
    const { iap, iapMock, listeners } = await loadIapModule({ os: 'ios' });
    await iap.init();
    expect(iapMock?.initConnection).toHaveBeenCalledTimes(1);
    expect(iapMock?.purchaseUpdatedListener).toHaveBeenCalledTimes(1);
    expect(iapMock?.purchaseErrorListener).toHaveBeenCalledTimes(1);
    expect(listeners.onPurchaseUpdated).toBeInstanceOf(Function);
    expect(listeners.onPurchaseError).toBeInstanceOf(Function);
  });

  it('init swallows native connection failures but still registers listeners', async () => {
    const { iap, iapMock, listeners } = await loadIapModule({
      os: 'android',
      mockOverrides: {
        initConnection: jest.fn().mockRejectedValue(new Error('boom')),
      },
    });
    await expect(iap.init()).resolves.toBeUndefined();
    expect(iapMock?.purchaseUpdatedListener).toHaveBeenCalledTimes(1);
    expect(listeners.onPurchaseUpdated).toBeInstanceOf(Function);
    await iap.teardown();
  });

  it('init is idempotent', async () => {
    const { iap, iapMock } = await loadIapModule({ os: 'ios' });
    await iap.init();
    await iap.init();
    expect(iapMock?.initConnection).toHaveBeenCalledTimes(1);
  });

  it('loadUnlocks returns persisted unlock state', async () => {
    const { iap, unlocksStore } = await loadIapModule({ os: 'web' });
    unlocksStore.read.mockResolvedValueOnce({ diablo: true });
    await expect(iap.loadUnlocks()).resolves.toEqual({ diablo: true });
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
    const { iap, unlocksStore } = await loadIapModule({ os: 'ios', hasIapModule: false });
    await expect(iap.purchaseDiablo()).resolves.toEqual({
      success: false,
      error: 'IAP module unavailable on this build. Run in a dev client.',
    });
    expect(unlocksStore.write).not.toHaveBeenCalled();
  });

  it('purchaseDiablo resolves success from the purchaseUpdated listener', async () => {
    const { iap, iapMock, listeners, unlocksStore } = await loadIapModule({ os: 'ios' });
    await iap.init();
    const promise = iap.purchaseDiablo();
    await flushMicrotasks();
    listeners.onPurchaseUpdated?.({ productId: 'com.picante.diablo', transactionId: 'tx-1' });
    await expect(promise).resolves.toEqual({ success: true });
    expect(iapMock?.finishTransaction).toHaveBeenCalledWith({
      purchase: { productId: 'com.picante.diablo', transactionId: 'tx-1' },
      isConsumable: false,
    });
    expect(unlocksStore.write).toHaveBeenCalledWith({ diablo: true });
  });

  it('purchaseDiablo ignores purchaseUpdated events for other products', async () => {
    const { iap, listeners, unlocksStore } = await loadIapModule({ os: 'ios' });
    await iap.init();
    const promise = iap.purchaseDiablo();
    await flushMicrotasks();
    listeners.onPurchaseUpdated?.({ productId: 'com.picante.other' });
    listeners.onPurchaseError?.({ message: 'User cancelled' });
    await expect(promise).resolves.toEqual({ success: false, error: 'User cancelled' });
    expect(unlocksStore.write).not.toHaveBeenCalled();
  });

  it('purchaseDiablo reports errors from the purchaseError listener', async () => {
    const { iap, listeners } = await loadIapModule({ os: 'ios' });
    await iap.init();
    const promise = iap.purchaseDiablo();
    await flushMicrotasks();
    listeners.onPurchaseError?.({ message: 'Card declined', code: 'E_CARD_DECLINED' });
    await expect(promise).resolves.toEqual({ success: false, error: 'Card declined' });
  });

  it('purchaseDiablo maps thrown requestPurchase errors into the response', async () => {
    const { iap } = await loadIapModule({
      os: 'android',
      mockOverrides: {
        requestPurchase: jest.fn().mockRejectedValue(new Error('boom')),
      },
    });
    await expect(iap.purchaseDiablo()).resolves.toEqual({ success: false, error: 'boom' });
  });

  it('restorePurchases unlocks Diablo when the platform reports ownership', async () => {
    const { iap, unlocksStore } = await loadIapModule({
      os: 'ios',
      mockOverrides: {
        getAvailablePurchases: jest
          .fn()
          .mockResolvedValue([{ productId: 'com.picante.diablo' }]),
      },
    });
    await expect(iap.restorePurchases()).resolves.toEqual({ diablo: true });
    expect(unlocksStore.write).toHaveBeenCalledWith({ diablo: true });
  });

  it('restorePurchases preserves existing unlock state when platform reports nothing', async () => {
    const { iap, unlocksStore } = await loadIapModule({ os: 'ios' });
    unlocksStore.read.mockResolvedValueOnce({ diablo: false });
    await expect(iap.restorePurchases()).resolves.toEqual({ diablo: false });
    expect(unlocksStore.write).not.toHaveBeenCalled();
  });

  it('restorePurchases swallows platform errors and returns current unlocks', async () => {
    const { iap, unlocksStore } = await loadIapModule({
      os: 'ios',
      mockOverrides: {
        restorePurchases: jest.fn().mockRejectedValue(new Error('network')),
      },
    });
    unlocksStore.read.mockResolvedValueOnce({ diablo: true });
    await expect(iap.restorePurchases()).resolves.toEqual({ diablo: true });
  });

  it('restorePurchases returns current unlocks on web without touching platform', async () => {
    const { iap, iapMock } = await loadIapModule({ os: 'web' });
    await expect(iap.restorePurchases()).resolves.toEqual({ diablo: false });
    expect(iapMock?.restorePurchases).not.toHaveBeenCalled();
  });

  it('teardown removes listeners and resets initialized state', async () => {
    const { iap, iapMock } = await loadIapModule({ os: 'ios' });
    await iap.init();
    await iap.teardown();
    expect(iapMock?.endConnection).toHaveBeenCalledTimes(1);
    // Re-init should re-register listeners
    await iap.init();
    expect(iapMock?.initConnection).toHaveBeenCalledTimes(2);
  });
});
