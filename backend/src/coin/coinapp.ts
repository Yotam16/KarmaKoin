// backend/src/coin/CoinApp.ts
import crypto from "crypto";
import type { User } from "../types/user";
import type { Transaction } from "../types/blockchain";

export class CoinApp {
  // Map userId → balance
  private wallets: Record<User["id"], number> = {};

  // Ledger of all transactions
  private ledger: Transaction[] = [];

  /* -----------------------------
     Wallets
  ------------------------------ */

  createWallet(userId: User["id"]): void {
    if (this.wallets[userId] !== undefined) {
      throw new Error("Wallet already exists");
    }
    this.wallets[userId] = 0;
  }

  getBalance(userId: User["id"]): number {
    return this.wallets[userId] ?? 0;
  }

  /* -----------------------------
     Minting / system credit
  ------------------------------ */

  mint(toUserId: User["id"], amount: number, description = "Initial credit"): void {
    if (amount <= 0) throw new Error("Mint amount must be positive");

    this.wallets[toUserId] = (this.wallets[toUserId] ?? 0) + amount;

    this.recordTransaction({
      id: crypto.randomUUID(),
      fromUserId: "SYSTEM" as User["id"], // SYSTEM pseudo-user
      toUserId,
      amount,
      description,
      timestamp: Date.now(),
    });
  }

  /* -----------------------------
     Transfers between users
  ------------------------------ */

  transfer(fromUserId: User["id"], toUserId: User["id"], amount: number, description = ""): void {
    if (amount <= 0) throw new Error("Transfer amount must be positive");
    if (this.getBalance(fromUserId) < amount) throw new Error("Insufficient balance");

    this.wallets[fromUserId] -= amount;
    this.wallets[toUserId] = (this.wallets[toUserId] ?? 0) + amount;

    this.recordTransaction({
      id: crypto.randomUUID(),
      fromUserId,
      toUserId,
      amount,
      description,
      timestamp: Date.now(),
    });
  }

  /* -----------------------------
     Ledger
  ------------------------------ */

  private recordTransaction(tx: Transaction): void {
    this.ledger.push(tx);
  }

  getLedger(): Transaction[] {
    return this.ledger;
  }
}
