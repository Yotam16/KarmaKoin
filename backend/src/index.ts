import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import { Blockchain } from "./blockchain-engine";
import type { User } from "./types/user";

const { randomUUID } = crypto;

const app = express();
const PORT = 3001;

app.use(express.json());

/* ---------------------------------------------
   Load users from JSON
---------------------------------------------- */

const usersFilePath = path.join(__dirname, "../../data/mock-users.json");
const users: User[] = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

/* ---------------------------------------------
   Build user index for fast lookup
---------------------------------------------- */

const userIndex = new Map<string, User>();
for (const user of users) {
  userIndex.set(user.id, user);
}

/* ---------------------------------------------
   User validation
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
   Initialize blockchain engine
---------------------------------------------- */

const blockchain = new Blockchain();

/* ---------------------------------------------
   Routes
---------------------------------------------- */

app.get("/status", (_req, res) => {
  res.json({
    blocks: blockchain.chain.length,
    pendingTransactions: blockchain.pendingTransactions.length,
    isValid: blockchain.isChainValid(),
  });
});

app.get("/chain", (_req, res) => {
  res.json(blockchain.chain);
});

app.get("/users", (_req, res) => {
  res.json(users);
});

app.post("/transaction", (req, res) => {
  try {
    const { fromUserId, toUserId, amount, description } = req.body;

    assertUserExists(fromUserId);
    assertUserExists(toUserId);

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    blockchain.addTransaction({
      id: randomUUID(),
      fromUserId,
      toUserId,
      amount,
      description: description ?? "",
      timestamp: Date.now(),
    });

    res.json({ message: "Transaction added" });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post("/mine", (_req, res) => {
  const block = blockchain.minePendingTransactions();
  res.json(block);
});

/* ---------------------------------------------
   Start server
---------------------------------------------- */

app.listen(PORT, () => {
  console.log(`KarmaKoin API running at http://localhost:${PORT}`);
});
