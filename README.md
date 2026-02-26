# Solana Token Swap Application

A fully functional Solana token swap application built with React, TypeScript, and integrated with Jupiter Aggregator API.

## Features

- **Wallet Connection**: Connect your Solana wallet (Phantom, Solflare)
- **Token Swapping**: Swap between popular Solana tokens (SOL, USDC, USDT, mSOL)
- **Real-time Quotes**: Get live swap quotes from Jupiter Aggregator
- **Smooth UX**: Beautiful, modern interface with loading states and error handling

## Getting Started

### Prerequisites

- Node.js 16+ installed
- A Solana wallet (Phantom or Solflare recommended)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## How to Use

1. **Connect Wallet**: Click the "Select Wallet" button in the top right
2. **Select Tokens**: Choose the tokens you want to swap from the dropdowns
3. **Enter Amount**: Type the amount you want to swap
4. **Review Quote**: The app will automatically fetch the best rate from Jupiter
5. **Swap**: Click the "Swap" button to execute the transaction

## Supported Tokens

- SOL (Solana)
- USDC (USD Coin)
- USDT (Tether USD)
- mSOL (Marinade Staked SOL)

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Solana Web3.js** - Blockchain interaction
- **Solana Wallet Adapter** - Wallet connection
- **Jupiter API v6** - Token swap aggregator
- **Vite** - Build tool

## Architecture

The application is organized into modular components:

- `WalletProvider.tsx` - Handles wallet connection and Solana network setup
- `SwapInterface.tsx` - Main swap UI and Jupiter API integration
- `App.tsx` - Main application entry point

## Security Notes

- Always verify transaction details before confirming
- The app uses a 0.5% slippage tolerance by default
- Transactions are submitted directly to the Solana blockchain
- Your private keys never leave your wallet

## License

MIT
# Swap UI
