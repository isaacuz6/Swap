import { WalletProvider } from './components/WalletProvider';
import { SwapInterface } from './components/SwapInterface';

function App() {
  // work harder
  return (
    <WalletProvider>
      <SwapInterface />
    </WalletProvider>
  );
}

export default App;
