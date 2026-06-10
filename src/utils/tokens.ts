export type Token = {
  symbol: string
  name: string
  mint: string
  decimals: number
  logoURI?: string
}

export const DEFAULT_TOKENS: Token[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  },
  {
    symbol: 'RAY',
    name: 'Raydium',
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
  },
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    decimals: 6,
    logoURI: 'https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link',
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    decimals: 6,
    logoURI: 'https://static.jup.ag/jup/icon.png',
  },
  {
    symbol: 'JTO',
    name: 'Jito',
    mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    decimals: 9,
    logoURI: 'https://metadata.jito.network/token/jto/image',
  },
  {
    symbol: 'PYTH',
    name: 'Pyth Network',
    mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    decimals: 6,
    logoURI: 'https://pyth.network/token.svg',
  },
  {
    symbol: 'ORCA',
    name: 'Orca',
    mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
  },
]

const isMintAddress = (query: string) => query.length >= 32 && /^[A-Za-z0-9]+$/.test(query)

export async function searchTokens(query: string): Promise<Token[]> {
  if (!query || query.trim().length < 1) return DEFAULT_TOKENS

  const q = query.trim()

  try {
    if (isMintAddress(q)) {
      const res = await fetch(`https://api-v3.raydium.io/mint/ids?mints=${q}`)
      const data = await res.json()
      if (data?.success && data?.data?.length) {
        const t = data.data[0]
        return [{
          symbol: t.symbol || q.slice(0, 6).toUpperCase(),
          name: t.name || 'Unknown Token',
          mint: t.address,
          decimals: t.decimals ?? 6,
          logoURI: t.logoURI || undefined,
        }]
      }
      return [{
        symbol: q.slice(0, 6).toUpperCase(),
        name: 'Unknown Token',
        mint: q,
        decimals: 6,
      }]
    }

    const res = await fetch(
      `https://api-v3.raydium.io/mint/search?keyword=${encodeURIComponent(q)}&pageSize=30`
    )
    const data = await res.json()

    if (!data?.success || !data?.data?.length) {
      return DEFAULT_TOKENS.filter(t =>
        t.symbol.toLowerCase().includes(q.toLowerCase()) ||
        t.name.toLowerCase().includes(q.toLowerCase())
      )
    }

    return data.data.map((t: any) => ({
      symbol: t.symbol || '???',
      name: t.name || 'Unknown',
      mint: t.address,
      decimals: t.decimals ?? 6,
      logoURI: t.logoURI || undefined,
    }))

  } catch {
    return DEFAULT_TOKENS.filter(t =>
      t.symbol.toLowerCase().includes(q.toLowerCase()) ||
      t.name.toLowerCase().includes(q.toLowerCase())
    )
  }
}