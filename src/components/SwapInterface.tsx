import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { ArrowDownUp, RefreshCw } from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

const POPULAR_TOKENS: Token[] = [
  {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
  },
  {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  {
    address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    symbol: 'mSOL',
    name: 'Marinade Staked SOL',
    decimals: 9,
  },
];

export const SwapInterface = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [fromToken, setFromToken] = useState<Token>(POPULAR_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(POPULAR_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quoteResponse, setQuoteResponse] = useState<any>(null);

  const getQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      setQuoteResponse(null);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const amountInSmallestUnit = Math.floor(
        parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)
      );

      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${fromToken.address}&outputMint=${toToken.address}&amount=${amountInSmallestUnit}&slippageBps=50`
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setQuoteResponse(data);
      const outAmount = parseInt(data.outAmount) / Math.pow(10, toToken.decimals);
      setToAmount(outAmount.toFixed(6));
    } catch (err: any) {
      setError(err.message || 'Failed to get quote');
      setToAmount('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fromAmount) {
        getQuote();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!publicKey || !quoteResponse) {
      setError('Please connect wallet and get a quote first');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: publicKey.toString(),
          wrapAndUnwrapSol: true,
        }),
      });

      const { swapTransaction } = await response.json();

      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        maxRetries: 2,
      });

      await connection.confirmTransaction(signature, 'confirmed');

      alert('Swap successful! Signature: ' + signature);
      setFromAmount('');
      setToAmount('');
      setQuoteResponse(null);
    } catch (err: any) {
      setError(err.message || 'Swap failed');
      console.error('Swap error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Swap Tokens</h1>
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          </div>

          <div className="space-y-2">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">From</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-2xl outline-none"
                  disabled={!publicKey}
                />
                <select
                  value={fromToken.address}
                  onChange={(e) => {
                    const token = POPULAR_TOKENS.find(t => t.address === e.target.value);
                    if (token) setFromToken(token);
                  }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 outline-none"
                >
                  {POPULAR_TOKENS.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center -my-2 z-10">
              <button
                onClick={handleFlipTokens}
                className="bg-gray-800 p-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
              >
                <ArrowDownUp className="text-white" size={20} />
              </button>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">To</span>
                {isLoading && (
                  <RefreshCw className="text-purple-400 animate-spin" size={16} />
                )}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={toAmount}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-2xl outline-none"
                  disabled
                />
                <select
                  value={toToken.address}
                  onChange={(e) => {
                    const token = POPULAR_TOKENS.find(t => t.address === e.target.value);
                    if (token) setToToken(token);
                  }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 outline-none"
                >
                  {POPULAR_TOKENS.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {quoteResponse && (
            <div className="mt-4 bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rate</span>
                <span className="text-white">
                  1 {fromToken.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSwap}
            disabled={!publicKey || !quoteResponse || isLoading}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
          >
            {!publicKey ? 'Connect Wallet' : isLoading ? 'Processing...' : 'Swap'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Powered by Jupiter Aggregator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
