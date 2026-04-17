declare module 'react-native-iap' {
  export function initConnection(): Promise<boolean>;
  export function endConnection(): Promise<void>;
  export function requestPurchase(args: {
    sku: string;
    andDangerouslyFinishTransactionAutomaticallyIOS?: boolean;
  }): Promise<unknown>;
  export function getProducts(args: { skus: string[] }): Promise<unknown[]>;
  export function finishTransaction(args: {
    purchase: unknown;
    isConsumable?: boolean;
  }): Promise<void>;
}
