import express from "express";
import path from "path";
import open from "open";

import { Blockchain } from "./blockchain-engine";
import { CoinApp, SYSTEM_USER_ID } from "./coin/coinapp";
import type { User } from "./types/user";

import * as userDb from "./db/userDB";
import * as ledgerDb from "./db/ledgerDB";

const app = express();
const PORT = 3001;

app.use(express.json());

// Serve static frontend
const frontendPath = path.join(__dirname, "../public");
app.use(express.static(frontendPath));

/* ---------------------------------------------
   Initialize blockchain engine & coin app
---------------------------------------------- */
const blockchain = new Blockchain();
const coinApp = new CoinApp();

/* ---------------------------------------------
   Helper for user ID validation
---------------------------------------------- */
function isValidUserIdFormat(id: string): boolean {
  return /^[A-Za-z0-9]{8}$/.test(id);
}

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

// Return all users
app.get("/users", (_req, res) => {
  res.json(userDb.getAllUsers());
});

// Add a transaction to blockchain
app.post("/transaction", (req, res) => {
  try {
    const { fromUserId, toUserId, amount, description } = req.body;

    userDb.assertUserExists(fromUserId);
    userDb.assertUserExists(toUserId);

    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });

    blockchain.addTransaction({
      id: crypto.randomUUID(),
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
   CoinApp: mint and transfer with DB-backed ledger
---------------------------------------------- */

// Mint coins to a user
app.post("/mint", (req, res) => {
  try {
    const { toUserId, amount, description, create } = req.body;

    if (!isValidUserIdFormat(toUserId)) throw new Error(`Invalid user ID format: ${toUserId}`);

    if (!userDb.userExists(toUserId)) {
      if (create) {
        userDb.createUser(toUserId, toUserId);
        coinApp.createWallet(toUserId);
      } else {
        return res.status(400).json({
          error: `User '${toUserId}' does not exist. Set create=true to create wallet automatically.`,
        });
      }
    }

    if (amount <= 0) throw new Error("Amount must be positive");

    const { transaction, toBalance } = coinApp.mint(toUserId, amount, description ?? "Mint via API");

    res.json({
      message: `Minted ${transaction.amount} coins to ${transaction.toUserId}`,
      balance: toBalance,
    });
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
      if (!isValidUserIdFormat(id)) throw new Error(`Invalid user ID format: ${id}`);

      if (!userDb.userExists(id)) {
        if (create) {
          userDb.createUser(id, id);
          coinApp.createWallet(id);
        } else {
          return res.status(400).json({
            error: `User '${id}' does not exist. Set create=true to create wallet automatically.`,
          });
        }
      }
    }

    if (amount <= 0) throw new Error("Amount must be positive");

    const { transaction, fromBalance, toBalance } = coinApp.transfer(
      fromUserId,
      toUserId,
      amount,
      description ?? "Transfer via API"
    );

    res.json({
      message: `Transferred ${transaction.amount} coins from ${transaction.fromUserId} to ${transaction.toUserId}`,
      fromBalance,
      toBalance,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Return coin ledger
app.get("/ledger", (_req, res) => {
  res.json(coinApp.getLedger());
});

/* ---------------------------------------------
   Start server and open browser
---------------------------------------------- */
app.listen(PORT, () => {
  console.log(`KarmaKoin API running at http://localhost:${PORT}`);
  open(`http://localhost:${PORT}/`);
});
