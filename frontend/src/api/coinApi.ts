import { CoinApp } from "../../../backend/src//coin/coinapp.ts";

export const coin = new CoinApp();

// optional: bootstrap some users
coin.mint("alice", 1000, "Genesis");
coin.mint("bob", 500, "Genesis");

export function getState() {
  return {
    ledger: coin.getLedger(),
  };
}

export function mint(toUserId: string, amount: number, description: string) {
  coin.mint(toUserId, amount, description);
}

export function transfer(from: string, to: string, amount: number, description: string) {
  coin.transfer(from, to, amount, description);
}
