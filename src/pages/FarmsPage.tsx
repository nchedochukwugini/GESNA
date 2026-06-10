import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Farm {
  id: string
  name?: string
  symbolMints?: any
  lpMint?: { symbol?: string; logoURI?: string }
  tvl?: number
  apr?: number
  totalApr?: number
  rewardInfos?: { mint: { symbol: string; logoURI?: string } }[]
}

interface Props {
  theme: 'dark' | 'light'
}

export default function FarmsPage({ theme }: Props) {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)

  const isDark = theme === 'dark'
  const textColor = isDark ? '#e0f0ff' : '#0a1628'
  const accentColor = isDark ? 'var(--g-cyan)' : '#0055cc'
  const dimColor = isDark ? 'rgba(224,240,255,0.4)' : 'rgba(0,50,150,0.5)'

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true)
        const res = await fetch('https://api-v3.raydium.io/main/stake-pools?page=1&pageSize=50')
        const data = await res.json()
        if (data.success) {
          const list = data.data?.data || data.data || []
          console.log('farm sample:', list[0])
          setFarms(list)
        }
      } catch {
        setFarms([])
      } finally {
        setLoading(false)
      }
    }
    fetchFarms()
  }, [])

  const getFarmName = (farm: Farm) => {
    if (farm.name) return farm.name
    if (Array.isArray(farm.symbolMints)) {
      return farm.symbolMints.map((m: any) =>
        typeof m === 'string' ? m : (m?.symbol || m?.mint?.symbol || '?')
      ).join('/')
    }
    if (typeof farm.symbolMints === 'string') return farm.symbolMints
    if (farm.lpMint?.symbol) return farm.lpMint.symbol
    return 'RAY Stake Pool'
  }

  const getApr = (farm: Farm) => {
    const apr = farm.totalApr ?? farm.apr ?? 0
    return Number(apr).toFixed(2)
  }

  const getTvl = (farm: Farm) => {
    const tvl = farm.tvl ?? 0
    if (tvl >= 1e9) return '$' + (tvl / 1e9).toFixed(2) + 'B'
    if (tvl >= 1e6) return '$' + (tvl / 1e6).toFixed(2) + 'M'
    if (tvl >= 1e3) return '$' + (tvl / 1e3).toFixed(1) + 'K'
    return '$' + tvl.toFixed(2)
  }

  return (
    <div style={{ padding: '100px 2rem 2rem', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: accentColor, textShadow: isDark ? '0 0 30px var(--g-cyan)' : 'none', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            YIELD FARMS
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: dimColor }}>
            Stake LP tokens and earn rewards
          </p>
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: dimColor, letterSpacing: '0.1em', borderBottom: isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.1)', marginBottom: '0.5rem' }}>
          <span>FARM</span>
          <span style={{ textAlign: 'right' }}>REWARDS</span>
          <span style={{ textAlign: 'right' }}>TVL</span>
          <span style={{ textAlign: 'right' }}>APR</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: accentColor }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>LOADING FARMS...</motion.span>
          </div>
        ) : farms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: dimColor }}>No farms found</div>
        ) : (
          farms.map((farm, i) => (
            <motion.div
              key={farm.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              whileHover={{ background: isDark ? 'rgba(0,245,255,0.04)' : 'rgba(0,100,200,0.04)' }}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.9rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s', borderBottom: isDark ? '1px solid rgba(0,245,255,0.04)' : '1px solid rgba(0,100,200,0.06)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {farm.lpMint?.logoURI && (
                  <img src={farm.lpMint.logoURI} style={{ width: 28, height: 28, borderRadius: '50%' }} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600, color: textColor }}>
                  {getFarmName(farm)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', flexWrap: 'wrap' }}>
                {farm.rewardInfos?.slice(0, 2).map((r, ri) => (
                  <span key={ri} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: isDark ? 'var(--g-gold)' : '#c9800a', background: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(201,128,10,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {r.mint?.symbol || '?'}
                  </span>
                ))}
                {(!farm.rewardInfos || farm.rewardInfos.length === 0) && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: isDark ? 'var(--g-gold)' : '#c9800a', background: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(201,128,10,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    RAY
                  </span>
                )}
              </div>

              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {getTvl(farm)}
              </div>

              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: Number(getApr(farm)) > 50 ? 'var(--g-green)' : textColor, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: 600 }}>
                {getApr(farm)}%
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}