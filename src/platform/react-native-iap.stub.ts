export async function initConnection(): Promise<boolean> {
  return false;
}

export async function endConnection(): Promise<void> {}

export async function requestPurchase(_args: {
  sku: string;
  andDangerouslyFinishTransactionAutomaticallyIOS?: boolean;
}): Promise<null> {
  return null;
}

export async function getProducts(_args: { skus: string[] }): Promise<unknown[]> {
  return [];
}

export async function finishTransaction(_args: {
  purchase: unknown;
  isConsumable?: boolean;
}): Promise<void> {}
