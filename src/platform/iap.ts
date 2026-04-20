import { Platform } from 'react-native';
import { unlocksStore, type UnlocksState } from '@game/persistence';

export const DIABLO_PRODUCT_ID = 'com.picante.diablo';
export const DIABLO_PRICE = '$4.99';

export type PurchaseResult = { success: boolean; error?: string };

export type IapFacade = {
  init: () => Promise<void>;
  loadUnlocks: () => Promise<UnlocksState>;
  purchaseDiablo: () => Promise<PurchaseResult>;
  restorePurchases: () => Promise<UnlocksState>;
  teardown: () => Promise<void>;
};

type ExpoIap = typeof import('expo-iap');

type PendingPurchase = {
  resolve: (result: PurchaseResult) => void;
  timeout: ReturnType<typeof setTimeout>;
};

let initialized = false;
let purchaseUpdatedSub: { remove: () => void } | null = null;
let purchaseErrorSub: { remove: () => void } | null = null;
let pendingPurchase: PendingPurchase | null = null;

const PURCHASE_TIMEOUT_MS = 60_000;

async function loadExpoIap(): Promise<ExpoIap | null> {
  try {
    const mod = await import('expo-iap');
    return mod as unknown as ExpoIap;
  } catch {
    return null;
  }
}

function clearPending() {
  if (!pendingPurchase) return;
  clearTimeout(pendingPurchase.timeout);
  pendingPurchase = null;
}

function resolvePending(result: PurchaseResult) {
  const pending = pendingPurchase;
  clearPending();
  pending?.resolve(result);
}

async function handlePurchaseUpdated(
  mod: ExpoIap,
  purchase: { id?: string; productId?: string; transactionId?: string } & Record<string, unknown>,
) {
  const productId = (purchase.productId ?? purchase.id) as string | undefined;
  if (productId !== DIABLO_PRODUCT_ID) return;
  try {
    await mod.finishTransaction({ purchase: purchase as never, isConsumable: false });
  } catch {
    // Non-fatal — listener is still authoritative. Transaction can be re-finished next launch.
  }
  await unlocksStore.write({ diablo: true });
  resolvePending({ success: true });
}

function handlePurchaseError(error: { message?: string; code?: string } | undefined) {
  if (!pendingPurchase) return;
  const message = error?.message ?? 'Purchase failed.';
  resolvePending({ success: false, error: message });
}

export const iap: IapFacade = {
  async init() {
    if (initialized) return;
    if (Platform.OS === 'web') {
      initialized = true;
      return;
    }
    const mod = await loadExpoIap();
    if (!mod) return;
    try {
      await mod.initConnection();
    } catch {
      // connection may fail in dev / offline — swallow
    }
    purchaseUpdatedSub = mod.purchaseUpdatedListener((purchase) => {
      void handlePurchaseUpdated(mod, purchase as never);
    });
    purchaseErrorSub = mod.purchaseErrorListener((err) => {
      handlePurchaseError(err);
    });
    initialized = true;
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

    const mod = await loadExpoIap();
    if (!mod) {
      return {
        success: false,
        error: 'IAP module unavailable on this build. Run in a dev client.',
      };
    }

    if (!initialized) {
      await iap.init();
    }

    if (pendingPurchase) {
      return { success: false, error: 'A purchase is already in progress.' };
    }

    return new Promise<PurchaseResult>((resolve) => {
      const timeout = setTimeout(() => {
        resolvePending({ success: false, error: 'Purchase timed out.' });
      }, PURCHASE_TIMEOUT_MS);
      const timeoutHandle = timeout as unknown as { unref?: () => void };
      if (typeof timeoutHandle.unref === 'function') {
        timeoutHandle.unref();
      }
      pendingPurchase = { resolve, timeout };

      mod
        .requestPurchase({
          request: {
            ios: { sku: DIABLO_PRODUCT_ID },
            android: { skus: [DIABLO_PRODUCT_ID] },
          },
          type: 'in-app',
        } as never)
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Purchase failed.';
          resolvePending({ success: false, error: message });
        });
    });
  },

  async restorePurchases() {
    const existing = await unlocksStore.read();

    if (Platform.OS === 'web') return existing;

    const mod = await loadExpoIap();
    if (!mod) return existing;

    if (!initialized) {
      await iap.init();
    }

    try {
      await mod.restorePurchases();
      const purchases = await mod.getAvailablePurchases();
      const ownsDiablo = Array.isArray(purchases)
        ? purchases.some(
            (p: unknown) =>
              typeof p === 'object' &&
              p !== null &&
              ((p as { productId?: string }).productId === DIABLO_PRODUCT_ID ||
                (p as { id?: string }).id === DIABLO_PRODUCT_ID),
          )
        : false;

      if (ownsDiablo && !existing.diablo) {
        const next: UnlocksState = { diablo: true };
        await unlocksStore.write(next);
        return next;
      }
      return { diablo: existing.diablo || ownsDiablo };
    } catch {
      return existing;
    }
  },

  async teardown() {
    purchaseUpdatedSub?.remove();
    purchaseErrorSub?.remove();
    purchaseUpdatedSub = null;
    purchaseErrorSub = null;
    clearPending();
    const mod = await loadExpoIap();
    try {
      await mod?.endConnection();
    } catch {
      // ignore
    }
    initialized = false;
  },
};
