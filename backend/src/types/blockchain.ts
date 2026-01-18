import { User } from "./identity";

export interface Transaction {
  id: string;
  fromUserId: User["id"];
  toUserId: User["id"];
  amount: number;
  description: string;
  timestamp: number;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
}

export interface HistoricBlock {
  period: string;
  userBalances: Record<User["id"], number>;
  merkleRoot: string;
  timestamp: number;
}

export interface Blockchain {
  chain: Block[];
  historicBlocks: HistoricBlock[];
  pendingTransactions: Transaction[];
}