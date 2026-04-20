import * as iapStub from '@platform/react-native-iap.stub';

describe('react-native-iap stub', () => {
  it('initConnection resolves false', async () => {
    await expect(iapStub.initConnection()).resolves.toBe(false);
  });

  it('endConnection resolves void', async () => {
    await expect(iapStub.endConnection()).resolves.toBeUndefined();
  });

  it('requestPurchase returns null', async () => {
    await expect(
      iapStub.requestPurchase({
        sku: 'com.picante.diablo',
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      }),
    ).resolves.toBeNull();
  });

  it('getProducts returns an empty list', async () => {
    await expect(iapStub.getProducts({ skus: ['com.picante.diablo'] })).resolves.toEqual([]);
  });

  it('finishTransaction resolves void', async () => {
    await expect(iapStub.finishTransaction({ purchase: {} })).resolves.toBeUndefined();
  });
});
