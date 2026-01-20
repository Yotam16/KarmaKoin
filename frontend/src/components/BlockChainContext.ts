import { createContext } from "react";

export type Transaction = { from: string; to: string; amount: number; timestamp: number };

export interface BlockchainContextType {
  wallets: Record<string, number>;
  currentUser: string | null;
  transactions: Transaction[];
  createWallet: (address: string) => void;
  sendCoin: (from: string, to: string, amount: number) => boolean;
  getBalance: (address: string) => number;
  setCurrentUser: (address: string) => void;
}

// Stub context
export const BlockchainContext = createContext<BlockchainContextType>({
  wallets: {},
  currentUser: null,
  transactions: [],
  createWallet: () => {},
  sendCoin: () => false,
  getBalance: () => 0,
  setCurrentUser: () => {},
});

// Minimal stub provider — just a function returning the context object
export function BlockchainProvider() {
  return {
    wallets: {},
    currentUser: null,
    transactions: [],
    createWallet: () => {},
    sendCoin: () => false,
    getBalance: () => 0,
    setCurrentUser: () => {},
  } as BlockchainContextType;
}
