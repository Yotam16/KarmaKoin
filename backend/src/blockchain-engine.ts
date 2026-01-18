// src/blockchain.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Block, Transaction } from "./types/blockchain";

const CHAIN_FILE = path.join(__dirname, "chain.json");

export class Blockchain {
  chain: Block[] = [];
  pendingTransactions: Transaction[] = [];

  constructor() {
    this.loadChain();
    if (this.chain.length === 0) {
      const genesisBlock = this.createBlock([], "0");
      this.chain.push(genesisBlock);
      this.saveChain();
    }
  }

  createBlock(transactions: Transaction[], previousHash: string): Block {
    const index = this.chain.length + 1;
    const timestamp = Date.now();
    let nonce = 0;
    let hash = this.calculateHash(index, timestamp, transactions, previousHash, nonce);

    while (!hash.startsWith("0000")) {
      nonce++;
      hash = this.calculateHash(index, timestamp, transactions, previousHash, nonce);
    }

    return { index, timestamp, transactions, previousHash, hash, nonce };
  }

  calculateHash(index: number, timestamp: number, transactions: Transaction[], previousHash: string, nonce: number): string {
    const data = index + timestamp + JSON.stringify(transactions) + previousHash + nonce;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  addTransaction(transaction: Transaction) {
    if (!transaction.timestamp) transaction.timestamp = Date.now();
    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions() {
    const previousHash = this.chain[this.chain.length - 1].hash;
    const block = this.createBlock(this.pendingTransactions, previousHash);
    this.chain.push(block);
    this.pendingTransactions = [];
    this.saveChain();
    return block;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== this.calculateHash(current.index, current.timestamp, current.transactions, current.previousHash, current.nonce)) {
        return false;
      }

      if (current.previousHash !== previous.hash) {
        return false;
      }
    }
    return true;
  }

  getLatestBlock(): Block {
  return this.chain[this.chain.length - 1];
}

  saveChain() {
    fs.writeFileSync(CHAIN_FILE, JSON.stringify(this.chain, null, 2));
  }

  loadChain() {
    if (fs.existsSync(CHAIN_FILE)) {
      const data = fs.readFileSync(CHAIN_FILE, "utf-8");
      this.chain = JSON.parse(data);
    }
  }
}
