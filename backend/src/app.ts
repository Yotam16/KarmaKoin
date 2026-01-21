// backend/src/App.ts
import { CoinApp } from "./coin/coinapp";

function App(): void {
  const coin = new CoinApp();

  // Example user IDs
  const aliceId = "alice";
  const bobId = "bob";

  // Automatically create wallets when adding users
  coin.createWallet(aliceId);
  coin.createWallet(bobId);

  // Mint initial coins to Alice
  coin.mint(aliceId, 1000, "Initial reward");

  // Alice pays Bob
  coin.transfer(aliceId, bobId, 250, "Payment for service");

  // Another transaction with description
  coin.transfer(aliceId, bobId, 50, "Coffee payment");

  // Display balances
  console.log("Alice balance:", coin.getBalance(aliceId));
  console.log("Bob balance:", coin.getBalance(bobId));

  // Display full ledger
  console.log("Ledger:");
  coin.getLedger().forEach((tx) => {
    console.log(
      `TX ${tx.id}: ${tx.fromUserId} -> ${tx.toUserId} | ${tx.amount} | ${tx.description} | ${new Date(
        tx.timestamp
      ).toLocaleString()}`
    );
  });
}

App();
