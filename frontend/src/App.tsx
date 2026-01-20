import { BlockchainProvider } from "./components/BlockChainContext";
import type { BlockchainContextType } from "./components/BlockChainContext";


function App() {
  // Call the provider function to get context data
  const blockchain: BlockchainContextType = BlockchainProvider();

  // Example usage
  blockchain.createWallet("my-wallet");
  blockchain.sendCoin("my-wallet", "another-wallet", 100);

  console.log("Current wallets:", blockchain.wallets);
  console.log("Transactions:", blockchain.transactions);

  // Since this is .ts, we cannot return JSX, just return a string or void
  return "App ran successfully";
}

// Run the app function
console.log(App());
