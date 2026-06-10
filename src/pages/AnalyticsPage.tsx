import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Stats {
  tvl: number
  volume24h: number
  volume7d: number
  fee24h: number
  totalVolume: number
}

interface Props {
  theme: 'dark' | 'light'
}

export default function AnalyticsPage({ theme }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const isDark = theme === 'dark'
  const textColor = isDark ? '#e0f0ff' : '#0a1628'
  const accentColor = isDark ? 'var(--g-cyan)' : '#0055cc'
  const dimColor = isDark ? 'rgba(224,240,255,0.4)' : 'rgba(0,50,150,0.5)'
  const cardBg = isDark ? 'rgba(10,22,40,0.8)' : 'rgba(255,255,255,0.8)'
  const borderColor = isDark ? '1px solid var(--border-glow)' : '1px solid rgba(0,100,200,0.2)'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await fetch('https://api-v3.raydium.io/main/info')
        const data = await res.json()
        if (data.success) {
          setStats({
            tvl: data.data?.tvl ?? 0,
            volume24h: data.data?.volume24h ?? 0,
            volume7d: data.data?.volume7d ?? 0,
            fee24h: data.data?.fee24h ?? 0,
            totalVolume: data.data?.totalVolume ?? 0,
          })
        }
      } catch {
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const fmt = (n: number | undefined) => {
    if (!n || isNaN(n)) return '$0'
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K'
    return '$' + n.toFixed(2)
  }

  const statCards = stats ? [
    { label: 'TOTAL VALUE LOCKED', value: fmt(stats.tvl), color: isDark ? 'var(--g-cyan)' : '#0055cc', glow: isDark ? '0 0 30px var(--g-cyan)' : 'none' },
    { label: '24H VOLUME', value: fmt(stats.volume24h), color: isDark ? 'var(--g-purple)' : '#6a00e0', glow: isDark ? '0 0 30px var(--g-purple)' : 'none' },
    { label: '7D VOLUME', value: fmt(stats.volume7d), color: isDark ? 'var(--g-gold)' : '#c9800a', glow: isDark ? '0 0 30px var(--g-gold)' : 'none' },
    { label: '24H FEES', value: fmt(stats.fee24h), color: isDark ? 'var(--g-green)' : '#00a854', glow: isDark ? '0 0 30px var(--g-green)' : 'none' },
    { label: 'TOTAL VOLUME', value: fmt(stats.totalVolume), color: isDark ? 'var(--g-cyan)' : '#0055cc', glow: isDark ? '0 0 30px var(--g-cyan)' : 'none' },
  ] : []

  return (
    <div style={{ padding: '100px 2rem 2rem', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: accentColor, textShadow: isDark ? '0 0 30px var(--g-cyan)' : 'none', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            ANALYTICS
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: dimColor }}>
            Real-time Raydium protocol statistics
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: accentColor }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>LOADING STATS...</motion.span>
          </div>
        ) : !stats ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: dimColor }}>Failed to load stats</div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.03, boxShadow: card.glow }}
                  style={{ background: cardBg, border: borderColor, borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(20px)' }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: dimColor, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                    {card.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 900, color: card.color, textShadow: card.glow }}>
                    {card.value}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Protocol info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ background: cardBg, border: borderColor, borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(20px)' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.2em', color: accentColor, marginBottom: '1.5rem' }}>
                PROTOCOL INFO
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {[
                  { label: 'Protocol', value: 'Raydium V3' },
                  { label: 'Network', value: 'Solana Mainnet' },
                  { label: 'Pool Types', value: 'CPMM, Standard, CLMM' },
                  { label: 'Aggregator', value: 'Gesna DEX' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: dimColor, marginBottom: '4px', letterSpacing: '0.1em' }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: textColor, fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}