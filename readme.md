# KarmaKoin

KarmaKoin is a simple blockchain & coin simulation app. It allows you to mint coins, transfer coins between users, and view the ledger through a browser UI.

## Setup

1. Install dependencies:
npm install

2. Compile frontend TypeScript to JavaScript:
npx tsc

3. Start the backend server:
npx ts-node backend/src/index.ts

4. Browser window should open automatically. if not, go to:
http://localhost:3001/

## Notes

- User balances are stored in memory in CoinApp. This means balances are updated directly when you mint or transfer coins, instead of being computed by summing all ledger transactions. (TO FIX!)
- All transactions are recorded in the ledger (CoinApp.getLedger()), which can be used later for auditing or recalculating balances if you switch to a real database.

## To-Do

-   lose the memory reading, compute balance each and every time
-   test files for index.js, coinApp.ts
-   transaction timestamps?
-   users, user auth
