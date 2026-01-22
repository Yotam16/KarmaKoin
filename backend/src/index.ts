// backend/src/index.ts

import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import { Blockchain } from "./blockchain-engine";
import { CoinApp } from "./coin/coinapp";
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
   Initialize blockchain engine & coin app
---------------------------------------------- */
const blockchain = new Blockchain();
const coinApp = new CoinApp();

/* ---------------------------------------------
   Routes
---------------------------------------------- */

// Basic blockchain info
app.get("/status", (_req, res) => {
  res.json({
    blocks: blockchain.chain.length,
    pendingTransactions: blockchain.pendingTransactions.length,
    isValid: blockchain.isChainValid(),
  });
});

// Return full blockchain
app.get("/chain", (_req, res) => {
  res.json(blockchain.chain);
});

// Return users
app.get("/users", (_req, res) => {
  res.json(users);
});

// Add a transaction to blockchain
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

// Mine pending transactions
app.post("/mine", (_req, res) => {
  const block = blockchain.minePendingTransactions();
  res.json(block);
});

/* ---------------------------------------------
   CoinApp: mint and transfer with auto wallet creation
---------------------------------------------- */

// Mint coins to a user
app.post("/mint", (req, res) => {
  try {
    const { toUserId, amount, description, create } = req.body;

    if (!isValidUserIdFormat(toUserId)) {
      throw new Error(`Invalid user ID format: ${toUserId}`);
    }

    // Auto-create wallet if flagged
    if (!userIndex.has(toUserId)) {
      if (create) {
        const newUser: User = {
          id: toUserId,
          name: toUserId,
          createdAt: Date.now(),
        };
        users.push(newUser);
        userIndex.set(toUserId, newUser);
        coinApp.createWallet(toUserId);
      } else {
        return res.status(400).json({
          error: `User '${toUserId}' does not exist. Set create=true to create wallet automatically.`,
        });
      }
    }

    if (amount <= 0) throw new Error("Amount must be positive");

    coinApp.mint(toUserId, amount, description ?? "Mint via API");

    res.json({ message: "Coins minted" });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Transfer coins between users
app.post("/transfer", (req, res) => {
  try {
    const { fromUserId, toUserId, amount, description, create } = req.body;

    // Auto-create wallets if flagged
    for (const id of [fromUserId, toUserId]) {
      if (!isValidUserIdFormat(id)) {
        throw new Error(`Invalid user ID format: ${id}`);
      }

      if (!userIndex.has(id)) {
        if (create) {
          const newUser: User = {
            id,
            name: id,
            createdAt: Date.now(),
          };
          users.push(newUser);
          userIndex.set(id, newUser);
          coinApp.createWallet(id);
        } else {
          return res.status(400).json({
            error: `User '${id}' does not exist. Set create=true to create wallet automatically.`,
          });
        }
      }
    }

    if (amount <= 0) throw new Error("Amount must be positive");

    coinApp.transfer(fromUserId, toUserId, amount, description ?? "Transfer via API");

    res.json({ message: "Transfer successful" });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Return coin ledger
app.get("/ledger", (_req, res) => {
  res.json(coinApp.getLedger());
});

/* ---------------------------------------------
   Start server
---------------------------------------------- */
app.listen(PORT, () => {
  console.log(`KarmaKoin API running at http://localhost:${PORT}`);
});
