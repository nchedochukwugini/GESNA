import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet } from '@reown/appkit/networks'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'

const solanaAdapter = new SolanaAdapter({
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ],
})

export const modal = createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet],
  metadata: {
    name: 'Gesna',
    description: 'Solana DEX Aggregator',
    url: 'https://gesna.app',
    icons: [],
  },
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  features: {
    analytics: false,
  },
  themeMode: 'dark',
})