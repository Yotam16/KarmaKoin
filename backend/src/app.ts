// backend/src/App.ts

/**
 * KarmaCoin CLI
 *
 * Commands:
 * 1. Transfer coins:  node App.ts <fromUser> <toUser> <amount>
 *    - Prompts to create wallets if missing
 * 2. Show user:       node App.ts show <user>
 *    - Displays balance and all transactions
 * Notes:
 *  - Amount must be positive
 *  - SYSTEM is used as pseudo-user for minting
 *  - Transactions include id, fromUserId, toUserId, amount, description, timestamp
 */

import { CoinApp } from "./coin/coinapp";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const coin = new CoinApp();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: node App.ts <fromUser> <toUser> <amount> OR node App.ts show <user>");
    process.exit(0);
  }

  if (args[0].toLowerCase() === "show") {
    const userId = args[1];
    if (!userId) { console.log("Specify user ID"); process.exit(1); }

    if (!coin.getBalance(userId)) {
      const answer = await ask(`User "${userId}" does not exist. Create wallet? (y/n): `);
      if (answer.toLowerCase() === "y") coin.createWallet(userId);
      else { console.log("Aborting."); process.exit(1); }
    }

    console.log(`${userId} balance:`, coin.getBalance(userId));
    console.log("Transactions:");
    coin.getLedger()
      .filter(tx => tx.fromUserId === userId || tx.toUserId === userId)
      .forEach(tx => console.log(
        `TX ${tx.id}: ${tx.fromUserId} -> ${tx.toUserId} | ${tx.amount} | ${tx.description} | ${new Date(tx.timestamp).toLocaleString()}`
      ));
    process.exit(0);
  }

  const [fromUser, toUser, amountStr] = args;
  const amount = Number(amountStr);
  if (!fromUser || !toUser || isNaN(amount)) {
    console.log("Usage: node App.ts <fromUser> <toUser> <amount>"); process.exit(1);
  }

  for (const userId of [fromUser, toUser]) {
    if (coin.getBalance(userId) === 0 && !coin.getLedger().some(tx => tx.fromUserId === userId || tx.toUserId === userId)) {
      const answer = await ask(`User "${userId}" does not exist. Create wallet? (y/n): `);
      if (answer.toLowerCase() === "y") coin.createWallet(userId);
      else { console.log("Aborting."); process.exit(1); }
    }
  }

  try {
    coin.transfer(fromUser, toUser, amount, "CLI transfer");
    console.log(`Transferred ${amount} from ${fromUser} to ${toUser}`);
  } catch (err) {
    console.error("Error:", (err as Error).message); process.exit(1);
  }

  console.log(`${fromUser} balance: ${coin.getBalance(fromUser)}`);
  console.log(`${toUser} balance: ${coin.getBalance(toUser)}`);
  rl.close();
}

main();
