import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import open from "open";

import { Blockchain } from "./blockchain-engine";
import { CoinApp } from "./coin/coinapp";
import type { User } from "./types/user";

const { randomUUID } = crypto;

const app = express();
const PORT = 3001;

app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "../public")));

/* ---------------------------------------------
   Load users from JSON
--------------------------------------------- */
const usersFilePath = path.join(__dirname, "../../data/mock-users.json");
const users: User[] = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

// Build user index for fast lookup
const userIndex = new Map<string, User>();
for (const user of users) userIndex.set(user.id, user);

/* ---------------------------------------------
   User validation helpers
--------------------------------------------- */
function isValidUserIdFormat(id: string): boolean {
  return /^[A-Za-z0-9]{8}$/.test(id);
}

function assertUserExists(userId: string): void {
  if (!isValidUserIdFormat(userId)) throw new Error(`Invalid user ID format: ${userId}`);
  if (!userIndex.has(userId)) throw new Error(`User does not exist: ${userId}`);
}

// Simple password check
function checkPassword(userId: string, password: string): boolean {
  const user = userIndex.get(userId);
  return user?.password === password;
}

/* ---------------------------------------------
   Initialize blockchain engine & coin app
--------------------------------------------- */
const blockchain = new Blockchain();
const coinApp = new CoinApp();

/* ---------------------------------------------
   Routes
--------------------------------------------- */

// LOGIN
app.post("/login", (req, res) => {
  const { userId, password } = req.body;
  if (!userIndex.has(userId)) return res.status(400).json({ error: "User does not exist" });
  if (!checkPassword(userId, password)) return res.status(401).json({ error: "Invalid password" });

  const user = userIndex.get(userId)!;
  res.json({
    message: `Login successful: ${user.fname} ${user.sname}`,
    role: user.role,
    userId: user.id,
  });
});

// Show all users (admin only)
app.get("/users", (req, res) => {
  const role = req.query.role as string;
  const userId = req.query.userId as string;

  if (role === "admin") {
    return res.json(users.map(u => ({ id: u.id, fname: u.fname, sname: u.sname, role: u.role })));
  } else if (role === "user" && userId) {
    const user = userIndex.get(userId);
    if (!user) return res.status(400).json({ error: "User not found" });
    const balance = coinApp.getBalance(userId);
    return res.json({ id: user.id, fname: user.fname, sname: user.sname, balance });
  } else {
    return res.status(403).json({ error: "Forbidden" });
  }
});

// Mint coins (admin only)
app.post("/mint", (req, res) => {
  const { userId, role, toUserId, amount, description, create } = req.body;

  if (role !== "admin") return res.status(403).json({ error: "Only admin can mint coins" });

  if (!userIndex.has(toUserId) && create) {
    const newUser: User = {
      id: toUserId,
      fname: toUserId,
      sname: "",
      password: "user",
      role: "user",
      createdAt: Date.now(),
    };
    users.push(newUser);
    userIndex.set(toUserId, newUser);
    coinApp.createWallet(toUserId);
  }

  coinApp.mint(toUserId, amount, description ?? "Mint via API");
  res.json({ message: `Minted ${amount} coins to ${toUserId}`, balance: coinApp.getBalance(toUserId) });
});

// Transfer coins
app.post("/transfer", (req, res) => {
  const { userId, role, fromUserId, toUserId, amount, description, create } = req.body;

  if (role !== "admin" && userId !== fromUserId) {
    return res.status(403).json({ error: "Cannot transfer from another user's account" });
  }

  // Auto-create wallets if flagged
  for (const id of [fromUserId, toUserId]) {
    if (!userIndex.has(id) && create) {
      const newUser: User = {
        id,
        fname: id,
        sname: "",
        password: "user",
        role: "user",
        createdAt: Date.now(),
      };
      users.push(newUser);
      userIndex.set(id, newUser);
      coinApp.createWallet(id);
    }
  }

  coinApp.transfer(fromUserId, toUserId, amount, description ?? "Transfer via API");

  const fromBalance = coinApp.getBalance(fromUserId);
  const toBalance = coinApp.getBalance(toUserId);

  res.json({
    message: `Transferred ${amount} coins from ${fromUserId} to ${toUserId}`,
    fromBalance,
    toBalance,
  });
});

// Show ledger (admin only)
app.get("/ledger", (req, res) => {
  const role = req.query.role as string;
  if (role !== "admin") return res.status(403).json({ error: "Only admin can view ledger" });
  res.json(coinApp.getLedger());
});

/* ---------------------------------------------
   Start server and open browser
--------------------------------------------- */
app.listen(PORT, () => {
  console.log(`KarmaKoin API running at http://localhost:${PORT}`);
  open(`http://localhost:${PORT}/`);
});
