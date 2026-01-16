const fs = require("fs");
const path = require("path");
import type { Blockchain } from "./types/ledger";
import type { User } from "./types/identity";
const crypto = require("crypto");

/* ---------------------------------------------
   Load users from JSON
---------------------------------------------- */

const usersFilePath = path.join(__dirname, "../data/mock-users.json");
const users: User[] = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

/* ---------------------------------------------
   Build user index for fast lookup
---------------------------------------------- */

const userIndex = new Map<string, User>();
for (const user of users) {
  userIndex.set(user.id, user);
}

/* ---------------------------------------------
   User ID validation
---------------------------------------------- */

function isValidUserIdFormat(id: string): boolean {
  return /^[A-Za-z0-9]{8}$/.test(id);
}

function assertUserExists(userId: string): void {
  if (!isValidUserIdFormat(userId)) {
    throw new Error(`Invalid user ID format: ${userId}`);
  }

  if (!userIndex.has(userId)) {
    throw new Error(`User does not exist: ${userId}`);
  }
}

/* ---------------------------------------------
   Initialize blockchain (in-memory)
---------------------------------------------- */

const chain: Blockchain = {
  chain: [],
  historicBlocks: [],
  pendingTransactions: []
};

/* ---------------------------------------------
   Create a transaction safely
---------------------------------------------- */

function addTransaction(
  fromUserId: string,
  toUserId: string,
  amount: number,
  description: string
) {
  assertUserExists(fromUserId);
  assertUserExists(toUserId);

  if (amount <= 0) {
    throw new Error("Transaction amount must be positive");
  }

  chain.pendingTransactions.push({
    id: crypto.randomUUID(),
    fromUserId,
    toUserId,
    amount,
    description,
    timestamp: Date.now()
  });
}

/* ---------------------------------------------
   Balance calculation (naive, correct)
---------------------------------------------- */

function getBalance(userId: string): number {
  assertUserExists(userId);

  let balance = 0;

  for (const tx of chain.pendingTransactions) {
    if (tx.fromUserId === userId) balance -= tx.amount;
    if (tx.toUserId === userId) balance += tx.amount;
  }

  return balance;
}
/* ---------------------------------------------
   Demo
---------------------------------------------- */

const sender = users[0];
const receiver = users[1];

if (!sender || !receiver) {
  throw new Error("Not enough users in mock-users.json to run demo");
}

// Add a transaction
addTransaction(sender.id, receiver.id, 10, "Guitar lesson");

console.log(`${sender.name} balance:`, getBalance(sender.id));
console.log(`${receiver.name} balance:`, getBalance(receiver.id));