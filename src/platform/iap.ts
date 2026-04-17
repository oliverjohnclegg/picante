import { Platform } from 'react-native';
import { unlocksStore, type UnlocksState } from '@game/persistence';

export const DIABLO_PRODUCT_ID = 'com.picante.diablo';
export const DIABLO_PRICE = '$4.99';

export type IapFacade = {
  init: () => Promise<void>;
  loadUnlocks: () => Promise<UnlocksState>;
  purchaseDiablo: () => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<UnlocksState>;
};

async function purchaseDiabloNative(): Promise<{ success: boolean; error?: string }> {
  try {
    const mod = await import('react-native-iap').catch(() => null);
    if (!mod) {
      return {
        success: false,
        error: 'IAP module unavailable on this build. Run in a dev client.',
      };
    }
    const RNIap = mod as typeof import('react-native-iap');
    const result = await RNIap.requestPurchase({
      sku: DIABLO_PRODUCT_ID,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });
    if (result) {
      await unlocksStore.write({ diablo: true });
      return { success: true };
    }
    return { success: false, error: 'Purchase did not complete.' };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export const iap: IapFacade = {
  async init() {
    if (Platform.OS === 'web') return;
    const mod = await import('react-native-iap').catch(() => null);
    if (!mod) return;
    const RNIap = mod as typeof import('react-native-iap');
    try {
      await RNIap.initConnection();
    } catch {
      // connection may fail in dev — gracefully ignore
    }
  },
  async loadUnlocks() {
    return unlocksStore.read();
  },
  async purchaseDiablo() {
    if (Platform.OS === 'web') {
      return {
        success: false,
        error: 'Web IAP coming soon — Tradicional is free and fully playable.',
      };
    }
    return purchaseDiabloNative();
  },
  async restorePurchases() {
    return unlocksStore.read();
  },
};
