import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Pool {
  id: string
  mintA: { symbol: string; logoURI?: string }
  mintB: { symbol: string; logoURI?: string }
  tvl: number
  day: { volume: number; apr: number }
  type: string
}

interface Props {
  theme: 'dark' | 'light'
}

export default function PoolsPage({ theme }: Props) {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'CPMM' | 'Standard' | 'CLMM'>('all')
  const [search, setSearch] = useState('')

  const isDark = theme === 'dark'
  const textColor = isDark ? '#e0f0ff' : '#0a1628'
  const accentColor = isDark ? 'var(--g-cyan)' : '#0055cc'
  const cardBg = isDark ? 'rgba(10,22,40,0.8)' : 'rgba(255,255,255,0.8)'
  const borderColor = isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.15)'
  const dimColor = isDark ? 'rgba(224,240,255,0.4)' : 'rgba(0,50,150,0.5)'

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true)
        const res = await fetch('https://api-v3.raydium.io/pools/info/list?poolType=all&poolSortField=liquidity&sortType=desc&pageSize=50&page=1')
        const data = await res.json()
        if (data.success) setPools(data.data.data || [])
      } catch {
        setPools([])
      } finally {
        setLoading(false)
      }
    }
    fetchPools()
  }, [])

  const filtered = pools.filter(p => {
    const matchType = filter === 'all' || p.type === filter
    const matchSearch = !search ||
      p.mintA.symbol.toLowerCase().includes(search.toLowerCase()) ||
      p.mintB.symbol.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const TokenLogo = ({ uri, symbol }: { uri?: string; symbol: string }) => (
    uri
      ? <img src={uri} style={{ width: 24, height: 24, borderRadius: '50%' }} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      : <div style={{ width: 24, height: 24, borderRadius: '50%', background: isDark ? 'rgba(0,245,255,0.2)' : 'rgba(0,100,200,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: accentColor, fontFamily: 'var(--font-display)' }}>{symbol.slice(0, 2)}</div>
  )

  return (
    <div style={{ padding: '100px 2rem 2rem', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: accentColor, textShadow: isDark ? '0 0 30px var(--g-cyan)' : 'none', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            LIQUIDITY POOLS
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: dimColor }}>
            Provide liquidity and earn trading fees
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search pools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: cardBg, border: borderColor, borderRadius: '10px', padding: '0.6rem 1rem', color: textColor, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none', width: '200px' }}
          />
          {(['all', 'CPMM', 'Standard', 'CLMM'] as const).map(f => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.05 }}
              onClick={() => setFilter(f)}
              style={{ background: filter === f ? isDark ? 'rgba(0,245,255,0.15)' : 'rgba(0,100,200,0.15)' : 'transparent', border: filter === f ? isDark ? '1px solid var(--g-cyan)' : '1px solid #0055cc' : borderColor, borderRadius: '8px', padding: '0.5rem 1rem', color: filter === f ? accentColor : dimColor, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em' }}
            >
              {f.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: dimColor, letterSpacing: '0.1em', borderBottom: isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.1)', marginBottom: '0.5rem' }}>
          <span>POOL</span>
          <span style={{ textAlign: 'right' }}>TYPE</span>
          <span style={{ textAlign: 'right' }}>TVL</span>
          <span style={{ textAlign: 'right' }}>24H VOL</span>
          <span style={{ textAlign: 'right' }}>APR</span>
        </div>

        {/* Pool rows */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: accentColor }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>LOADING POOLS...</motion.span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: dimColor }}>No pools found</div>
        ) : (
          filtered.map((pool, i) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              whileHover={{ background: isDark ? 'rgba(0,245,255,0.04)' : 'rgba(0,100,200,0.04)' }}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.9rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s', borderBottom: isDark ? '1px solid rgba(0,245,255,0.04)' : '1px solid rgba(0,100,200,0.06)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TokenLogo uri={pool.mintA.logoURI} symbol={pool.mintA.symbol} />
                  <div style={{ marginLeft: '-8px' }}>
                    <TokenLogo uri={pool.mintB.logoURI} symbol={pool.mintB.symbol} />
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600, color: textColor }}>
                  {pool.mintA.symbol}/{pool.mintB.symbol}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: isDark ? 'rgba(123,47,255,0.9)' : '#6a00e0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ background: isDark ? 'rgba(123,47,255,0.15)' : 'rgba(106,0,224,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem' }}>{pool.type}</span>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                ${pool.tvl >= 1000000 ? (pool.tvl / 1000000).toFixed(2) + 'M' : pool.tvl >= 1000 ? (pool.tvl / 1000).toFixed(1) + 'K' : pool.tvl.toFixed(0)}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                ${pool.day?.volume >= 1000000 ? (pool.day.volume / 1000000).toFixed(2) + 'M' : pool.day?.volume >= 1000 ? (pool.day.volume / 1000).toFixed(1) + 'K' : (pool.day?.volume || 0).toFixed(0)}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: pool.day?.apr > 20 ? 'var(--g-green)' : textColor, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: 600 }}>
                {(pool.day?.apr || 0).toFixed(2)}%
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}