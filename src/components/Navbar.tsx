import { motion } from 'framer-motion'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

interface Props {
  theme: 'dark' | 'light'
  toggleTheme: () => void
  activePage: 'swap' | 'pools' | 'farms' | 'analytics'
  setActivePage: (page: 'swap' | 'pools' | 'farms' | 'analytics') => void
}

export default function Navbar({ theme, toggleTheme, activePage, setActivePage }: Props) {
  const isDark = theme === 'dark'
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const links: { label: string; page: 'swap' | 'pools' | 'farms' | 'analytics' }[] = [
    { label: 'SWAP', page: 'swap' },
    { label: 'POOLS', page: 'pools' },
    { label: 'FARMS', page: 'farms' },
    { label: 'ANALYTICS', page: 'analytics' },
  ]

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem', height: '70px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: isDark ? 'rgba(2,4,8,0.75)' : 'rgba(232,244,255,0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(0,100,200,0.15)',
      }}
    >
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        onClick={() => setActivePage('swap')}
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem',
          letterSpacing: '0.2em', color: isDark ? 'var(--g-cyan)' : '#0055cc',
          textShadow: isDark ? '0 0 20px var(--g-cyan)' : 'none', cursor: 'pointer',
        }}
      >
        GESNA
      </motion.div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '2rem', fontFamily: 'var(--font-body)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
        {links.map(link => (
          <motion.span
            key={link.page}
            onClick={() => setActivePage(link.page)}
            whileHover={{ color: isDark ? 'var(--g-cyan)' : '#0055cc' }}
            style={{
              color: activePage === link.page
                ? isDark ? 'var(--g-cyan)' : '#0055cc'
                : isDark ? 'rgba(224,240,255,0.6)' : 'rgba(0,50,150,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textShadow: activePage === link.page && isDark ? '0 0 10px var(--g-cyan)' : 'none',
              borderBottom: activePage === link.page
                ? isDark ? '1px solid var(--g-cyan)' : '1px solid #0055cc'
                : '1px solid transparent',
              paddingBottom: '2px',
            }}
          >
            {link.label}
          </motion.span>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          style={{
            background: isDark ? 'var(--bg-card)' : 'rgba(255,255,255,0.9)',
            border: isDark ? '1px solid var(--border-glow)' : '1px solid rgba(0,100,200,0.3)',
            borderRadius: '8px', padding: '6px 12px',
            color: isDark ? 'var(--g-cyan)' : '#0055cc',
            cursor: 'pointer', fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem', letterSpacing: '0.1em',
          }}
        >
          {isDark ? 'LIGHT' : 'DARK'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: isDark ? '0 0 30px var(--g-cyan)' : '0 0 25px rgba(0,100,255,0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => open()}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(123,47,255,0.15))'
              : 'linear-gradient(135deg, rgba(0,100,255,0.12), rgba(100,0,200,0.12))',
            border: isDark ? '1px solid var(--border-active)' : '1px solid rgba(0,100,200,0.5)',
            borderRadius: '10px', padding: '8px 20px',
            color: isDark ? 'var(--g-cyan)' : '#0055cc',
            cursor: 'pointer', fontFamily: 'var(--font-display)',
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em',
            textShadow: isDark ? '0 0 10px var(--g-cyan)' : 'none',
          }}
        >
          {isConnected ? `${address?.slice(0, 4)}...${address?.slice(-4)}` : 'CONNECT WALLET'}
        </motion.button>
      </div>
    </motion.nav>
  )
}