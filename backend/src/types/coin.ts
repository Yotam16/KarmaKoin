// backend/src/types/coin.ts

import type { Transaction } from "./blockchain";

/**
 * Coin-level aliases and structures
 */

export type Address = string;

export type Wallets = Record<Address, number>;

/**
 * A coin ledger is simply a list of blockchain transactions
 * scoped to this coin
 */
export interface CoinLedger {
  transactions: Transaction[];
}
