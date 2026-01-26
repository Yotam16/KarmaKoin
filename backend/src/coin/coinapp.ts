// backend/src/coin/coinapp.ts

import crypto from "crypto";
import type { User } from "../types/user";
import type { Transaction } from "../types/blockchain";

import * as userDb from "../db/userDB";
import * as ledgerDb from "../db/ledgerDB";

export const SYSTEM_USER_ID = "SYSTEM" as User["id"];

export class CoinApp {
  /* ---------------------------------------------
     Wallets (derived, not stored)
  ---------------------------------------------- */

  getBalance(userId: User["id"]): number {
    return ledgerDb.getBalanceForUser(userId);
  }

  /* ---------------------------------------------
     Wallet creation (explicit but idempotent)
  ---------------------------------------------- */

  createWallet(userId: User["id"]): void {
    // Wallet existence is implied by user existence
    userDb.assertUserExists(userId);
  }

  /* ---------------------------------------------
     Minting / system credit
  ---------------------------------------------- */

  mint(
    toUserId: User["id"],
    amount: number,
    description = "Minted by system"
  ): {
    transaction: Transaction;
    toBalance: number;
  } {
    if (amount <= 0) {
      throw new Error("Mint amount must be positive");
    }

    userDb.assertUserExists(toUserId);

    const tx: Transaction = {
      id: crypto.randomUUID(),
      fromUserId: SYSTEM_USER_ID,
      toUserId,
      amount,
      description,
      timestamp: Date.now(),
    };

    ledgerDb.addTransaction(tx);

    return {
      transaction: tx,
      toBalance: this.getBalance(toUserId),
    };
  }

  /* ---------------------------------------------
     Transfers between users
  ---------------------------------------------- */

  transfer(
    fromUserId: User["id"],
    toUserId: User["id"],
    amount: number,
    description = ""
  ): {
    transaction: Transaction;
    fromBalance: number;
    toBalance: number;
  } {
    if (amount <= 0) {
      throw new Error("Transfer amount must be positive");
    }

    userDb.assertUserExists(fromUserId);
    userDb.assertUserExists(toUserId);

    const fromBalance = this.getBalance(fromUserId);
    if (fromBalance < amount) {
      throw new Error("Insufficient balance");
    }

    const tx: Transaction = {
      id: crypto.randomUUID(),
      fromUserId,
      toUserId,
      amount,
      description,
      timestamp: Date.now(),
    };

    ledgerDb.addTransaction(tx);

    return {
      transaction: tx,
      fromBalance: this.getBalance(fromUserId),
      toBalance: this.getBalance(toUserId),
    };
  }

  /* ---------------------------------------------
     Ledger access
  ---------------------------------------------- */

  getLedger(): Transaction[] {
    return ledgerDb.getAllTransactions();
  }
}
