/* -----------------------------------------------------------------
    This is what needs to be rewritten when switching to a real DB
-------------------------------------------------------------------- */


import fs from "fs";
import path from "path";
import type { Transaction } from "../types/blockchain";

const LEDGER_FILE_PATH = path.join(
  __dirname,
  "../../../data/mock-ledger.json"
);

/* ---------------------------------------------
   Internal helpers
---------------------------------------------- */

function readFile(): Transaction[] {
  if (!fs.existsSync(LEDGER_FILE_PATH)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(LEDGER_FILE_PATH, "utf-8"));
}

function writeFile(transactions: Transaction[]): void {
  fs.writeFileSync(
    LEDGER_FILE_PATH,
    JSON.stringify(transactions, null, 2),
    "utf-8"
  );
}

/* ---------------------------------------------
   Public API
---------------------------------------------- */

export function getAllTransactions(): Transaction[] {
  return readFile();
}

export function addTransaction(tx: Transaction): void {
  const ledger = readFile();
  ledger.push(tx);
  writeFile(ledger);
}

export function getBalanceForUser(userId: string): number {
  return readFile().reduce((balance, tx) => {
    if (tx.toUserId === userId) balance += tx.amount;
    if (tx.fromUserId === userId) balance -= tx.amount;
    return balance;
  }, 0);
}
