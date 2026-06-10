import { useState, useCallback } from 'react'
import { Connection, VersionedTransaction, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { API_URLS } from '@raydium-io/raydium-sdk-v2'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

const RPC = import.meta.env.VITE_HELIUS_RPC
const connection = new Connection(RPC, 'confirmed')
const WSOL = 'So11111111111111111111111111111111111111112'

interface SwapCompute {
  id: string
  success: boolean
  data: {
    swapType: string
    inputMint: string
    inputAmount: string
    outputMint: string
    outputAmount: string
    otherAmountThreshold: string
    slippageBps: number
    priceImpactPct: number
    routePlan: {
      poolId: string
      inputMint: string
      outputMint: string
      feeMint: string
      feeRate: number
      feeAmount: string
    }[]
  }
}

const decimalsCache: Record<string, number> = {
  [WSOL]: 9,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 6,
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 6,
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 6,
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 5,
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 6,
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 6,
  'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL': 9,
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': 6,
  'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE': 6,
}

async function getDecimals(mint: string): Promise<number> {
  if (decimalsCache[mint] !== undefined) return decimalsCache[mint]
  try {
    const res = await fetch(`https://api-v3.raydium.io/mint/ids?mints=${mint}`)
    const data = await res.json()
    const decimals = data?.data?.[0]?.decimals ?? 6
    decimalsCache[mint] = decimals
    return decimals
  } catch {
    return 6
  }
}

async function fetchWalletTokenAccounts(owner: string) {
  const ownerPk = new PublicKey(owner)
  const [spl, spl2022] = await Promise.all([
    connection.getParsedTokenAccountsByOwner(ownerPk, { programId: TOKEN_PROGRAM_ID }),
    connection.getParsedTokenAccountsByOwner(ownerPk, { programId: TOKEN_2022_PROGRAM_ID }),
  ])
  return [...spl.value, ...spl2022.value].map(({ pubkey, account }) => ({
    mint: (account.data as any).parsed?.info?.mint as string,
    publicKey: pubkey.toBase58(),
  })).filter(a => !!a.mint)
}

async function getPriorityFee(): Promise<number> {
  try {
    const res = await fetch('https://api-v3.raydium.io/main/auto-fee')
    const data = await res.json()
    return data?.data?.default?.h ?? 50000
  } catch {
    return 50000
  }
}

export function useSwap() {
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('solana')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quoteAmount, setQuoteAmount] = useState<string>('')
  const [priceImpact, setPriceImpact] = useState<string>('')
  const [route, setRoute] = useState<string>('')

  const getQuote = useCallback(async (
    inputMint: string,
    outputMint: string,
    amountIn: number,
    slippage = 0.5,
  ) => {
    if (!amountIn || amountIn <= 0) {
      setQuoteAmount(''); setPriceImpact(''); setRoute(''); return
    }
    try {
      setLoading(true)
      setError(null)

      const inputDecimals = await getDecimals(inputMint)
      const outputDecimals = await getDecimals(outputMint)
      const amountInLamports = Math.floor(amountIn * Math.pow(10, inputDecimals)).toString()

      const url = `${API_URLS.SWAP_HOST}/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInLamports}&slippageBps=${Math.floor(slippage * 100)}&txVersion=V0&referrer=9wwKxDjJgDv5Cnji6yYzUyG4yRmTWfGJ2hk7L5e5rTQM`
      const res = await fetch(url)
      const data: SwapCompute = await res.json()

      if (!data.success) {
        setError('No route found for this pair')
        setLoading(false)
        return
      }

      setRoute(data.data.routePlan?.length ? 'Raydium' : 'Direct')
      setPriceImpact(data.data.priceImpactPct.toFixed(2))
      const outAmount = Number(data.data.outputAmount) / Math.pow(10, outputDecimals)
      setQuoteAmount(outAmount.toFixed(6))

    } catch (e: any) {
      setError(e?.message || 'Quote failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const executeSwap = useCallback(async (
    inputMint: string,
    outputMint: string,
    amountIn: number,
    slippage = 0.5,
  ) => {
    if (!isConnected || !address || !walletProvider) {
      setError('Wallet not connected'); return
    }
    try {
      setLoading(true)
      setError(null)

      const isInputSol = inputMint === WSOL
      const isOutputSol = outputMint === WSOL

      const tokenAccounts = await fetchWalletTokenAccounts(address)
      const inputTokenAcc = tokenAccounts.find(a => a.mint === inputMint)?.publicKey
      const outputTokenAcc = tokenAccounts.find(a => a.mint === outputMint)?.publicKey

      if (!isInputSol && !inputTokenAcc) {
        setError('You do not have this token in your wallet')
        setLoading(false)
        return
      }

      const priorityFee = await getPriorityFee()

      const inputDecimals = await getDecimals(inputMint)
      const amountInLamports = Math.floor(amountIn * Math.pow(10, inputDecimals)).toString()
      const quoteUrl = `${API_URLS.SWAP_HOST}/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInLamports}&slippageBps=${Math.floor(slippage * 100)}&txVersion=V0&referrer=9wwKxDjJgDv5Cnji6yYzUyG4yRmTWfGJ2hk7L5e5rTQM`
      const quoteRes = await fetch(quoteUrl)
      const swapResponse: SwapCompute = await quoteRes.json()
      if (!swapResponse.success) { setError('Quote failed'); setLoading(false); return }

      const postBody: Record<string, any> = {
        computeUnitPriceMicroLamports: String(priorityFee),
        swapResponse,
        txVersion: 'V0',
        wallet: address,
        wrapSol: isInputSol,
        unwrapSol: isOutputSol,
        feeConfig: {
          feeBps: 5,
          feeAccount: '9wwKxDjJgDv5Cnji6yYzUyG4yRmTWfGJ2hk7L5e5rTQM',
        },
      }
      if (!isInputSol && inputTokenAcc) postBody.inputAccount = inputTokenAcc
      if (!isOutputSol && outputTokenAcc) postBody.outputAccount = outputTokenAcc

      const txRes = await fetch(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody),
      })

      const txData = await txRes.json()
      if (!txData.success) {
        setError(txData.msg || 'Transaction build failed')
        setLoading(false)
        return
      }

      const provider = walletProvider as any
      const allTx = txData.data.map((tx: any) =>
        VersionedTransaction.deserialize(Buffer.from(tx.transaction, 'base64'))
      )
      const signedTxs: VersionedTransaction[] = await provider.signAllTransactions(allTx)

      let lastTxId = ''
      for (const tx of signedTxs) {
        const txId = await connection.sendRawTransaction(tx.serialize(), {
          skipPreflight: true,
          maxRetries: 2,
        })
        await connection.confirmTransaction(txId, 'confirmed')
        lastTxId = txId
      }

      return lastTxId

    } catch (e: any) {
      setError(e?.message || 'Swap failed')
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletProvider])

  return { getQuote, executeSwap, loading, error, quoteAmount, priceImpact, route }
}