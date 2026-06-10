import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import Navbar from './Navbar'
import { useSwap } from '../hooks/useSwap'
import { DEFAULT_TOKENS, searchTokens } from '../utils/tokens'
import type { Token } from '../utils/tokens'
import { useAppKitAccount } from '@reown/appkit/react'
import PoolsPage from '../pages/PoolsPage'
import FarmsPage from '../pages/FarmsPage'
import AnalyticsPage from '../pages/AnalyticsPage'

const WSOL = 'So11111111111111111111111111111111111111112'

export default function MainApp() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [activePage, setActivePage] = useState<'swap' | 'pools' | 'farms' | 'analytics'>('swap')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isConnected, address } = useAppKitAccount()

  const [fromToken, setFromToken] = useState<Token>(DEFAULT_TOKENS[0])
  const [toToken, setToToken] = useState<Token>(DEFAULT_TOKENS[1])
  const [fromAmount, setFromAmount] = useState('')
  const [showFromSelector, setShowFromSelector] = useState(false)
  const [showToSelector, setShowToSelector] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)
  const [tokenSearch, setTokenSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Token[]>(DEFAULT_TOKENS)
  const [searchLoading, setSearchLoading] = useState(false)
  const [fromBalance, setFromBalance] = useState<string>('--')
  const [toBalance, setToBalance] = useState<string>('--')
  const [slippage, setSlippage] = useState<number>(0.5)
  const [showSlippage, setShowSlippage] = useState(false)

  const { getQuote, executeSwap, loading, error, quoteAmount, priceImpact, route } = useSwap()
  const rpcConnection = new Connection(import.meta.env.VITE_HELIUS_RPC, 'confirmed')

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const isDark = theme === 'dark'

  // Fetch balances
  useEffect(() => {
    if (!address) { setFromBalance('--'); setToBalance('--'); return }
    const fetchBalance = async (mint: string, setter: (v: string) => void) => {
      try {
        if (mint === WSOL) {
          const lamports = await rpcConnection.getBalance(new PublicKey(address))
          setter((lamports / LAMPORTS_PER_SOL).toFixed(4))
        } else {
          const ata = getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(address), false, TOKEN_PROGRAM_ID)
          const info = await rpcConnection.getTokenAccountBalance(ata)
          setter(info.value.uiAmountString || '0')
        }
      } catch {
        setter('0')
      }
    }
    fetchBalance(fromToken.mint, setFromBalance)
    fetchBalance(toToken.mint, setToBalance)
  }, [address, fromToken, toToken])

  // Debounced quote
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return
    const timer = setTimeout(() => {
      getQuote(fromToken.mint, toToken.mint, parseFloat(fromAmount), slippage)
    }, 600)
    return () => clearTimeout(timer)
  }, [fromAmount, fromToken, toToken, slippage])

  // Reset search when modal closes
  useEffect(() => {
    if (!showFromSelector && !showToSelector) {
      setTokenSearch('')
      setSearchResults(DEFAULT_TOKENS)
    }
  }, [showFromSelector, showToSelector])

  // Live token search
  useEffect(() => {
    if (!showFromSelector && !showToSelector) return
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      const results = await searchTokens(tokenSearch)
      setSearchResults(results)
      setSearchLoading(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [tokenSearch])

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return
    const id = await executeSwap(fromToken.mint, toToken.mint, parseFloat(fromAmount), slippage)
    if (id) { setTxId(id); setFromAmount('') }
  }

  const switchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(quoteAmount || '')
  }

  const openFromSelector = () => { setShowFromSelector(true); setShowToSelector(false) }
  const openToSelector = () => { setShowToSelector(true); setShowFromSelector(false) }
  const closeSelector = () => { setShowFromSelector(false); setShowToSelector(false) }
  const selectToken = (token: Token) => {
    if (showFromSelector) setFromToken(token)
    else setToToken(token)
    closeSelector()
  }

  // Canvas background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const startTime = Date.now()
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const nodes = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1,
      color: Math.floor(Math.random() * 3),
    }))
    const draw = () => {
      const elapsed = (Date.now() - startTime) / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      if (isDark) {
        bgGrad.addColorStop(0, '#020408')
        bgGrad.addColorStop(0.5, '#050b14')
        bgGrad.addColorStop(1, '#020408')
      } else {
        bgGrad.addColorStop(0, '#e8f4ff')
        bgGrad.addColorStop(0.5, '#f0f8ff')
        bgGrad.addColorStop(1, '#ddeeff')
      }
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.08)' : 'rgba(0,80,180,0.03)'
        ctx.fillRect(0, y, canvas.width, 1)
      }
      const gridSize = 60
      const offsetX = (elapsed * 15) % gridSize
      const offsetY = (elapsed * 8) % gridSize
      ctx.strokeStyle = isDark ? 'rgba(0,245,255,0.04)' : 'rgba(0,100,200,0.1)'
      ctx.lineWidth = 0.5
      for (let x = -gridSize + offsetX; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = -gridSize + offsetY; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
        const colors = isDark ? ['0,245,255', '123,47,255', '255,215,0'] : ['0,100,200', '100,0,200', '180,120,0']
        const alpha = (Math.sin(elapsed * 1.5 + n.x * 0.01) * 0.5 + 0.5) * 0.8 + 0.2
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${colors[n.color]},${alpha})`
        ctx.fill()
      })
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = isDark ? `rgba(0,245,255,${alpha})` : `rgba(0,100,200,${alpha * 2})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      for (let r = 0; r < 3; r++) {
        const radius = ((elapsed * 80 + r * 300) % 600)
        const alpha = Math.max(0, 1 - radius / 600) * 0.12
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = isDark ? `rgba(123,47,255,${alpha})` : `rgba(100,0,200,${alpha * 2})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      const vignette = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cx, cy))
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(0.6, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,50,120,0.2)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [theme])

  const tokenBg = isDark ? 'rgba(10,22,40,0.9)' : 'rgba(232,244,255,0.9)'
  const tokenBorder = isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.15)'
  const textColor = isDark ? '#e0f0ff' : '#0a1628'
  const labelColor = isDark ? 'rgba(0,245,255,0.35)' : 'rgba(0,100,200,0.5)'
  const accentColor = isDark ? 'var(--g-cyan)' : '#0055cc'
  const dimColor = isDark ? 'rgba(224,240,255,0.25)' : 'rgba(0,50,150,0.4)'

  const TokenLogo = ({ token, size = 20 }: { token: Token; size?: number }) => (
    token.logoURI
      ? <img src={token.logoURI} style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      : <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: isDark ? 'rgba(0,245,255,0.2)' : 'rgba(0,100,200,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, fontSize: size * 0.35, fontFamily: 'var(--font-display)' }}>
          {token.symbol.slice(0, 2)}
        </div>
  )

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: '500px', height: '500px', borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(123,47,255,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(100,0,220,0.12) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float1 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: '600px', height: '600px', borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(0,245,255,0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,120,255,0.12) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'float2 11s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '35%', width: '400px', height: '400px', borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(255,215,0,0.07) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(180,100,0,0.08) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'float3 13s ease-in-out infinite' }} />
      </div>

      <style>{`
        @keyframes float1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,-30px) scale(1.08)}66%{transform:translate(-25px,20px) scale(0.94)}}
        @keyframes float2{0%,100%{transform:translate(0,0)}50%{transform:translate(-50px,30px) scale(1.1)}}
        @keyframes float3{0%,100%{transform:translate(0,0)}40%{transform:translate(30px,-40px)}80%{transform:translate(-20px,15px)}}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        .token-scroll::-webkit-scrollbar{width:3px}
        .token-scroll::-webkit-scrollbar-track{background:transparent}
        .token-scroll::-webkit-scrollbar-thumb{background:rgba(0,245,255,0.2);border-radius:2px}
      `}</style>

      <Navbar theme={theme} toggleTheme={toggleTheme} activePage={activePage} setActivePage={setActivePage} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* SWAP PAGE */}
        {activePage === 'swap' && (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '90px 1rem 2rem' }}>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', letterSpacing: '0.5em', color: isDark ? 'rgba(0,245,255,0.5)' : 'rgba(0,100,200,0.7)', marginBottom: '0.5rem', textTransform: 'uppercase' }}
            >
              Solana DEX Aggregator
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '0.1em', color: accentColor, textShadow: isDark ? '0 0 40px var(--g-cyan), 0 0 80px rgba(0,245,255,0.3)' : '0 0 30px rgba(0,100,255,0.4)', marginBottom: '2rem', textAlign: 'center' }}
            >
              SWAP ANYTHING
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
              style={{ width: '100%', maxWidth: '480px', background: isDark ? 'rgba(5,11,20,0.88)' : 'rgba(255,255,255,0.82)', backdropFilter: 'blur(40px)', border: isDark ? '1px solid var(--border-glow)' : '1px solid rgba(0,100,200,0.2)', borderRadius: '24px', padding: '2rem', boxShadow: isDark ? '0 0 60px rgba(0,245,255,0.06), 0 30px 80px rgba(0,0,0,0.6)' : '0 0 40px rgba(0,100,255,0.08), 0 30px 60px rgba(0,50,150,0.1)' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.3em', color: isDark ? 'rgba(0,245,255,0.6)' : 'rgba(0,100,200,0.8)', marginBottom: '1.5rem' }}>
                SWAP
              </div>

              {/* FROM */}
              <div style={{ background: tokenBg, border: tokenBorder, borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', color: labelColor, marginBottom: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em' }}>FROM</div>
                  <input
                    type="number" placeholder="0.00" value={fromAmount}
                    onChange={e => setFromAmount(e.target.value)}
                    style={{ background: 'none', border: 'none', outline: 'none', color: textColor, fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, width: '100%', maxWidth: '180px' }}
                  />
                  <div style={{ fontSize: '0.65rem', color: dimColor, marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    Balance: {fromBalance}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} onClick={openFromSelector}
                  style={{ background: isDark ? 'rgba(13,31,56,0.9)' : 'rgba(255,255,255,0.95)', border: isDark ? '1px solid var(--border-glow)' : '1px solid rgba(0,100,200,0.3)', borderRadius: '12px', padding: '10px 14px', color: textColor, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                >
                  <TokenLogo token={fromToken} size={22} />
                  {fromToken.symbol}
                  <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>v</span>
                </motion.button>
              </div>

              {/* SWITCH */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0' }}>
                <motion.div
                  whileHover={{ rotate: 180, scale: 1.2 }} transition={{ duration: 0.3 }} onClick={switchTokens}
                  style={{ width: '38px', height: '38px', background: isDark ? 'rgba(13,31,56,0.9)' : 'rgba(255,255,255,0.95)', border: isDark ? '1px solid var(--border-glow)' : '1px solid rgba(0,100,200,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: accentColor, fontSize: '1.1rem' }}
                >
                  {'\u2195'}
                </motion.div>
              </div>

              {/* TO */}
              <div style={{ background: tokenBg, border: tokenBorder, borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', color: labelColor, marginBottom: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em' }}>TO (ESTIMATED)</div>
                  <div style={{ color: textColor, fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, minHeight: '2.2rem' }}>
                    {loading
                      ? <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>...</motion.span>
                      : quoteAmount || '0.00'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: dimColor, marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    Balance: {toBalance}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} onClick={openToSelector}
                  style={{ background: isDark ? 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(123,47,255,0.08))' : 'linear-gradient(135deg, rgba(0,100,255,0.08), rgba(100,0,200,0.08))', border: isDark ? '1px solid var(--border-active)' : '1px solid rgba(0,100,200,0.35)', borderRadius: '12px', padding: '10px 14px', color: accentColor, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, textShadow: isDark ? '0 0 8px var(--g-cyan)' : 'none' }}
                >
                  <TokenLogo token={toToken} size={22} />
                  {toToken.symbol}
                  <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>v</span>
                </motion.button>
              </div>

              {/* ROUTE INFO + SLIPPAGE */}
              <div style={{ background: isDark ? 'rgba(0,245,255,0.02)' : 'rgba(0,100,200,0.03)', border: isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.08)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: isDark ? 'rgba(224,240,255,0.3)' : 'rgba(0,50,150,0.45)' }}>
                  <span>Route: <span style={{ color: route ? accentColor : undefined }}>{route || '--'}</span></span>
                  <span>Impact: <span style={{ color: priceImpact && Number(priceImpact) > 1 ? 'var(--g-red)' : undefined }}>{priceImpact ? priceImpact + '%' : '--'}</span></span>
                  <motion.span
                    whileHover={{ color: accentColor }}
                    onClick={() => setShowSlippage(s => !s)}
                    style={{ cursor: 'pointer', color: slippage > 5 ? 'var(--g-red)' : undefined }}
                  >
                    Slippage: {slippage}% ⚙
                  </motion.span>
                </div>

                <AnimatePresence>
                  {showSlippage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.08)' }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: isDark ? 'rgba(0,245,255,0.4)' : 'rgba(0,100,200,0.5)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                        SLIPPAGE TOLERANCE
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {[0.1, 0.5, 1.0, 3.0].map(s => (
                          <motion.button
                            key={s}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSlippage(s)}
                            style={{
                              background: slippage === s ? isDark ? 'rgba(0,245,255,0.15)' : 'rgba(0,100,200,0.15)' : 'transparent',
                              border: slippage === s ? isDark ? '1px solid var(--g-cyan)' : '1px solid #0055cc' : isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.15)',
                              borderRadius: '8px', padding: '4px 10px',
                              color: slippage === s ? accentColor : isDark ? 'rgba(224,240,255,0.5)' : 'rgba(0,50,150,0.5)',
                              cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                            }}
                          >
                            {s}%
                          </motion.button>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number" placeholder="Custom" min="0.01" max="50" step="0.1"
                            onChange={e => {
                              const val = parseFloat(e.target.value)
                              if (!isNaN(val) && val > 0 && val <= 50) setSlippage(val)
                            }}
                            style={{ background: isDark ? 'rgba(10,22,40,0.9)' : 'rgba(232,244,255,0.9)', border: isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.15)', borderRadius: '8px', padding: '4px 8px', color: textColor, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', outline: 'none', width: '70px' }}
                          />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: dimColor }}>%</span>
                        </div>
                      </div>
                      {slippage > 5 && (
                        <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--g-red)' }}>
                          Warning: High slippage may result in unfavorable rates
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ERROR */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.25)', borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--g-red)' }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TX SUCCESS */}
              <AnimatePresence>
                {txId && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--g-green)' }}
                  >
                    {'TX: '}
                    <a href={'https://solscan.io/tx/' + txId} target="_blank" rel="noreferrer" style={{ color: 'var(--g-green)', textDecoration: 'underline' }}>
                      {txId.slice(0, 20) + '...'}
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SWAP BUTTON */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: isDark ? '0 0 50px rgba(0,245,255,0.25), 0 0 100px rgba(123,47,255,0.12)' : '0 0 35px rgba(0,100,255,0.25)' }}
                whileTap={{ scale: 0.98 }}
                onClick={isConnected ? handleSwap : undefined}
                disabled={loading}
                style={{ width: '100%', padding: '1.1rem', background: isDark ? 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(123,47,255,0.15))' : 'linear-gradient(135deg, rgba(0,100,255,0.12), rgba(100,0,200,0.12))', border: isDark ? '1px solid var(--border-active)' : '1px solid rgba(0,100,200,0.45)', borderRadius: '14px', color: accentColor, fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.3em', cursor: loading ? 'wait' : 'pointer', textShadow: isDark ? '0 0 10px var(--g-cyan)' : 'none', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
              >
                {loading ? 'COMPUTING...' : !isConnected ? 'CONNECT WALLET TO SWAP' : 'SWAP ' + fromToken.symbol + ' to ' + toToken.symbol}
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* OTHER PAGES */}
        {activePage === 'pools' && <PoolsPage theme={theme} />}
        {activePage === 'farms' && <FarmsPage theme={theme} />}
        {activePage === 'analytics' && <AnalyticsPage theme={theme} />}
      </div>

      {/* TOKEN SELECTOR MODAL */}
      <AnimatePresence>
        {(showFromSelector || showToSelector) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeSelector}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{ background: isDark ? 'rgba(5,11,20,0.98)' : 'rgba(240,248,255,0.98)', border: isDark ? '1px solid var(--border-glow)' : '1px solid rgba(0,100,200,0.2)', borderRadius: '20px', padding: '1.5rem', width: '100%', maxWidth: '400px', backdropFilter: 'blur(40px)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.2em', color: accentColor }}>SELECT TOKEN</div>
                <motion.div whileHover={{ scale: 1.1 }} onClick={closeSelector} style={{ cursor: 'pointer', color: isDark ? 'rgba(224,240,255,0.4)' : 'rgba(0,50,150,0.4)', fontSize: '1.2rem', lineHeight: 1 }}>X</motion.div>
              </div>

              <input
                autoFocus type="text"
                placeholder="Search name, symbol or paste mint..."
                value={tokenSearch}
                onChange={e => setTokenSearch(e.target.value)}
                style={{ width: '100%', background: isDark ? 'rgba(10,22,40,0.9)' : 'rgba(220,238,255,0.9)', border: isDark ? '1px solid var(--border-glow)' : '1px solid rgba(0,100,200,0.25)', borderRadius: '10px', padding: '0.75rem 1rem', color: textColor, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none', marginBottom: '0.8rem' }}
              />

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: isDark ? 'rgba(0,245,255,0.25)' : 'rgba(0,100,200,0.35)', marginBottom: '0.7rem' }}>
                {tokenSearch.length > 30 ? 'Looking up mint address...' : tokenSearch.length > 1 ? 'Searching Raydium pools...' : 'Top tokens by liquidity'}
              </div>

              <div className="token-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto', maxHeight: '360px' }}>
                {searchLoading ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: accentColor }}>
                    <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>SEARCHING...</motion.span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: isDark ? 'rgba(224,240,255,0.25)' : 'rgba(0,50,150,0.35)' }}>No tokens found</div>
                ) : (
                  searchResults.map(token => {
                    const isSelected = token.mint === fromToken.mint || token.mint === toToken.mint
                    return (
                      <motion.div
                        key={token.mint}
                        whileHover={{ scale: 1.015 }}
                        onClick={() => selectToken(token)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 0.9rem', borderRadius: '12px', cursor: 'pointer', background: isSelected ? isDark ? 'rgba(0,245,255,0.06)' : 'rgba(0,100,200,0.06)' : 'transparent', border: isSelected ? isDark ? '1px solid rgba(0,245,255,0.15)' : '1px solid rgba(0,100,200,0.15)' : isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.06)', transition: 'all 0.12s' }}
                      >
                        <TokenLogo token={token} size={36} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 600, color: isSelected ? accentColor : textColor }}>{token.symbol}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: isDark ? 'rgba(224,240,255,0.35)' : 'rgba(0,50,150,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{token.name}</div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: isDark ? 'rgba(0,245,255,0.25)' : 'rgba(0,100,200,0.35)', flexShrink: 0 }}>
                          {token.mint.slice(0, 4) + '...' + token.mint.slice(-4)}
                        </div>
                        {isSelected && <div style={{ color: accentColor, fontSize: '0.75rem', flexShrink: 0 }}>ok</div>}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}