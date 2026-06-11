# GESNA — Solana DEX Aggregator

<div align="center">

![Gesna Banner](https://img.shields.io/badge/GESNA-Solana%20DEX%20Aggregator-00f5ff?style=for-the-badge&logo=solana&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-7b2fff?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00ff88?style=for-the-badge)
![Built With](https://img.shields.io/badge/built%20with-React%20%2B%20Vite-ffd700?style=for-the-badge&logo=react)

**A hyper-realistic, game-engine grade DEX aggregator built on Solana.**
Swap any token at the best price powered by Raydium liquidity.

[Live Demo](https://gesna.vercel.app) • [GitHub](https://github.com/nchedochukwugini/GESNA)

</div>

---

## What is Gesna?

Gesna is a next-generation decentralized exchange (DEX) aggregator built on the Solana blockchain. It provides users with the best swap prices by routing trades through Raydium's deep liquidity pools, while delivering an immersive, game-engine quality user experience unlike anything in DeFi today.

Think of Gesna as the intersection of a AAA video game intro sequence and a professional trading terminal — built for Solana.

---

## Features

### Swap
- **Real-time quotes** — Live price feeds powered by Raydium API
- **Smart routing** — Automatically finds the best price across Raydium pools
- **Any token** — Swap any SPL token by name, symbol, or mint address
- **Live token search** — Search thousands of tokens with live Raydium pool data
- **Wallet balance display** — See your SOL and token balances in real time
- **Adjustable slippage** — Set custom slippage tolerance (0.1% to 50%)
- **Price impact warning** — Visual alerts for high price impact swaps
- **Transaction tracking** — Direct Solscan link after every successful swap
- **Fee collection** — 0.05% protocol fee on every swap

### Pools
- **Real-time pool data** — Live TVL, 24h volume, APR from Raydium
- **Filter by type** — CPMM, Standard, CLMM
- **Search pools** — Find any pool by token name or symbol
- **50 top pools** — Sorted by liquidity

### Farms
- **Active yield farms** — Live RAY staking pool data
- **TVL & APR display** — Real-time farm statistics
- **Reward tokens** — See exactly what you earn

### Analytics
- **Protocol TVL** — Total value locked across all Raydium pools
- **24h & 7d volume** — Real-time trading volume
- **24h fees** — Protocol fee generation
- **Total volume** — All-time trading volume
- **Protocol info** — Network and pool type details

### UX & Design
- **25-second cinematic preloader** — Alien transcendence game-engine boot sequence with procedural audio
- **8K ultra-HD aesthetic** — Hyper-realistic dark/light mode UI
- **Animated background** — Live particle network with pulse rings and floating orbs
- **Framer Motion animations** — Smooth, game-engine grade transitions throughout
- **Dark & Light mode** — Full theme support with animated canvas adapting to each
- **Responsive design** — Works on all screen sizes

### Wallet
- **Multi-wallet support** — Phantom, Solflare and more via Solana Wallet Adapter
- **WalletConnect** — QR code connection via Reown AppKit
- **Auto-detects token accounts** — Knows your balances without manual input

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + Inline Styles |
| **Animations** | Framer Motion |
| **Blockchain** | Solana Mainnet |
| **Swap Routing** | Raydium SDK v2 + REST API |
| **Wallet Connection** | Reown AppKit 1.8 + Solana Wallet Adapter |
| **RPC Provider** | Helius |
| **Audio Engine** | Web Audio API (procedural, zero files) |
| **Background FX** | HTML5 Canvas (particle network, hex grid) |
| **Deployment** | Vercel |

---

## Project Structure
gesna/
├── src/
│   ├── components/
│   │   ├── Preloader.tsx      # 25s cinematic boot sequence with audio
│   │   ├── MainApp.tsx        # Main app shell + swap page
│   │   └── Navbar.tsx         # Navigation with wallet connect
│   ├── pages/
│   │   ├── PoolsPage.tsx      # Live Raydium pools
│   │   ├── FarmsPage.tsx      # Active yield farms
│   │   └── AnalyticsPage.tsx  # Protocol statistics
│   ├── hooks/
│   │   └── useSwap.ts         # Swap logic — quotes + execution
│   ├── utils/
│   │   └── tokens.ts          # Token list + live Raydium search
│   ├── config/
│   │   └── wallet.tsx         # Reown AppKit + wallet adapter setup
│   ├── App.tsx                # Root component + preloader gate
│   ├── main.tsx               # Entry point
│   └── index.css              # Global CSS variables + Tailwind
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Solana wallet (Phantom or Solflare recommended)
- Helius API key — [helius.dev](https://helius.dev)
- Reown Project ID — [cloud.reown.com](https://cloud.reown.com)

### Installation

`bash
# Clone the repository
git clone https://github.com/nchedochukwugini/GESNA.git
cd GESNA

# Install dependencies
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env

# Environment Variables
Create a .env file in the root directory:
VITE_REOWN_PROJECT_ID=your_reown_project_id
VITE_HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=your_helius_api_key

# Development
npm run dev
Open http://localhost:5173 in your browser.

# Production Build
npm run build
npm run preview

## Deployment

# Deploy to Vercel
1. Fork this repository
2. Go to vercel.com and import the repo
3. Add environment variables:
    *VITE_REOWN_PROJECT_ID
    *VITE_HELIUS_RPC
4. Click Deploy

Vercel auto-detects Vite — no build configuration needed.

---

## How It Works

### Swap Flow
User enters amount
       ↓
Gesna fetches quote from Raydium API
(inputMint, outputMint, amount, slippage)
       ↓
Best route returned with price impact
       ↓
User clicks SWAP
       ↓
Gesna builds transaction via Raydium API
(includes 0.05% protocol fee to Gesna wallet)
       ↓
Wallet signs transaction
       ↓
Transaction sent to Solana mainnet
       ↓
TxID returned → Solscan link shown

## Token Search
User types in token selector
       ↓
If query > 30 chars → treat as mint address
  → Direct Raydium API mint lookup
       ↓
If query < 30 chars → symbol/name search
  → Raydium API pool search (30 results)
       ↓
Results cached for performance

---

## Audio Engine
The preloader features a fully procedural audio engine built with the Web Audio API — zero audio files, zero network requests. All sounds are mathematically generated:
**Alien drone — Sawtooth oscillators with frequency modulation
**Warp signal — LFO-modulated sine wave sweeping 300Hz → 1200Hz
**Machine choir — 8 harmonic overtones with vibrato
**Transcendence chord — Am → F → C → G chord progression
**Glorious swell — Perfect fifth harmonic stack
**Divine resolution — Pure sine wave cascade

---

## Revenue Model
Gesna earns 5 BPS (0.05%) on every swap executed through the platform. This fee is automatically collected via Raydium's feeConfig parameter in the transaction builder — no smart contract required.

---

### Roadmap
[x] Swap page with Raydium routing
[x] Live token search (all Raydium pools)
[x] Pools, Farms, Analytics pages
[x] Dark/Light mode
[x] Wallet balance display
[x] Slippage settings
[x] Protocol fee collection
[x] Vercel deployment
[ ] gesna-aggregator backend (Raydium + Orca + Meteora routing)
[ ] Multi-hop routing for better prices
[ ] Token price in USD
[ ] Portfolio tracking
[ ] Mobile app

---

## Contributing
Contributions are welcome! Please open an issue first to discuss what you would like to change.
1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

---

## License
MIT License — see LICENSE for details.

---

## Acknowledgements
*Raydium — DEX infrastructure and API
*Reown — Wallet connection
*Helius — Solana RPC
*Framer Motion — Animations
*Solana Web3.js — Blockchain interaction

---

Built with passion by Franklin
gesna.vercel.app
