import { Blockchain as BlockchainClass } from "./blockchain-engine";
import type { Transaction, Block } from "./types/blockchain";
import type { User } from "./types/user";

/* ---------------------------------------------
   Helper to create a test user
---------------------------------------------- */
function createUser(
  id: string,
  fname: string,
  sname: string,
  role: "admin" | "user" = "user",
  password: string = "user",
  initialBalance = 100
): User {
  return {
    id,
    fname,
    sname,
    role,
    password,
    createdAt: Date.now(),
  };
}

/* ---------------------------------------------
   Blockchain test routine
---------------------------------------------- */
function testBlockchain() {
  console.log("=== KarmaKoin Blockchain Test ===");

  // Create a Blockchain instance
  const karmaCoin = new BlockchainClass();

  // Create sample users
  const alice = createUser("u1", "Alice", "Wonder");
  const bob = createUser("u2", "Bob", "Builder");
  const charlie = createUser("u3", "Charlie", "Brown");

  // 1. Add transactions
  const tx1: Transaction = {
    id: "tx1",
    fromUserId: alice.id,
    toUserId: bob.id,
    amount: 50,
    description: "Alice sends Bob 50 Koin",
    timestamp: Date.now(),
  };

  const tx2: Transaction = {
    id: "tx2",
    fromUserId: bob.id,
    toUserId: charlie.id,
    amount: 25,
    description: "Bob sends Charlie 25 Koin",
    timestamp: Date.now(),
  };

  karmaCoin.addTransaction(tx1);
  karmaCoin.addTransaction(tx2);
  console.log("Pending Transactions:", karmaCoin.pendingTransactions);

  // 2. Mine pending transactions
  const minedBlock: Block = karmaCoin.minePendingTransactions();
  console.log("Mined Block:", minedBlock);

  // 3. Check latest block
  const latestBlock: Block = karmaCoin.getLatestBlock();
  console.log("Latest Block:", latestBlock);

  // 4. Verify chain validity
  const isValid = karmaCoin.isChainValid();
  console.log("Is Blockchain Valid?", isValid);

  // 5. Add another transaction and mine
  const tx3: Transaction = {
    id: "tx3",
    fromUserId: charlie.id,
    toUserId: alice.id,
    amount: 10,
    description: "Charlie sends Alice 10 Koin",
    timestamp: Date.now(),
  };

  karmaCoin.addTransaction(tx3);
  karmaCoin.minePendingTransactions();

  // 6. Verify chain again
  console.log("Final Blockchain Validity:", karmaCoin.isChainValid());

  // 7. Display entire chain
  console.log("Entire Chain:", karmaCoin.chain);
}

testBlockchain();

/*
| Function                      | How it’s tested                                       | Direct / Indirect |
| ----------------------------- | ----------------------------------------------------- | ----------------- |
| **constructor**               |                                                       | Direct            |
| **addTransaction()**          |                                                       | Direct            |
| **minePendingTransactions()** |                                                       | Direct            |
| **getLatestBlock()**          |                                                       | Direct            |
| **isChainValid()**            |                                                       | Direct            |
| **createBlock()**             | Called internally by `minePendingTransactions()`      | Indirect          |
| **calculateHash()**           | Called internally by `createBlock()` during mining    | Indirect          |
| **saveChain()**               | Called internally by `minePendingTransactions()`      | Indirect          |
| **loadChain()**               | Called internally by the constructor                  | Indirect          |
*/
