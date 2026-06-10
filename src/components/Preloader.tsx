import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
}

const SYSTEM_LINES = [
  'SOLANA NETWORK......CONNECTED',
  'RAYDIUM ENGINE......ONLINE',
  'WALLET ADAPTER......READY',
  'GESNA v1.0..........ARMED',
]

class GesnaAudio {
  ctx: AudioContext
  master: GainNode

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.6
    this.master.connect(this.ctx.destination)
  }

  now() { return this.ctx.currentTime }

  // Deep alien sub-bass drone
  alienDrone(freq: number, duration: number, vol: number, delay = 0) {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400
    osc.connect(filter); filter.connect(gain); gain.connect(this.master)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, this.now() + delay)
    osc.frequency.setValueAtTime(freq * 0.97, this.now() + delay + duration * 0.3)
    osc.frequency.setValueAtTime(freq * 1.02, this.now() + delay + duration * 0.7)
    gain.gain.setValueAtTime(0, this.now() + delay)
    gain.gain.linearRampToValueAtTime(vol, this.now() + delay + 1)
    gain.gain.linearRampToValueAtTime(vol * 0.8, this.now() + delay + duration - 1)
    gain.gain.linearRampToValueAtTime(0, this.now() + delay + duration)
    osc.start(this.now() + delay)
    osc.stop(this.now() + delay + duration)
  }

  // Alien warping transmission signal
  warpSignal(delay = 0) {
    const osc = this.ctx.createOscillator()
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()
    const gain = this.ctx.createGain()
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency)
    osc.connect(gain); gain.connect(this.master)
    osc.type = 'sine'
    lfo.type = 'sine'
    osc.frequency.setValueAtTime(300, this.now() + delay)
    osc.frequency.linearRampToValueAtTime(1200, this.now() + delay + 4)
    lfo.frequency.setValueAtTime(3, this.now() + delay)
    lfo.frequency.linearRampToValueAtTime(18, this.now() + delay + 4)
    lfoGain.gain.setValueAtTime(80, this.now() + delay)
    lfoGain.gain.linearRampToValueAtTime(200, this.now() + delay + 4)
    gain.gain.setValueAtTime(0, this.now() + delay)
    gain.gain.linearRampToValueAtTime(0.1, this.now() + delay + 0.5)
    gain.gain.linearRampToValueAtTime(0, this.now() + delay + 4)
    lfo.start(this.now() + delay)
    osc.start(this.now() + delay)
    lfo.stop(this.now() + delay + 4)
    osc.stop(this.now() + delay + 4)
  }

  // Eerie dissonant alien tone
  dissonantTone(freq: number, delay = 0, duration = 5) {
    [1, 1.03, 1.47, 1.78].forEach((ratio, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.connect(gain); gain.connect(this.master)
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq * ratio
      gain.gain.setValueAtTime(0, this.now() + delay)
      gain.gain.linearRampToValueAtTime(0.04, this.now() + delay + 1 + i * 0.3)
      gain.gain.linearRampToValueAtTime(0, this.now() + delay + duration)
      osc.start(this.now() + delay)
      osc.stop(this.now() + delay + duration)
    })
  }

  // Machine choir — harmonic overtone stack
  machineChoir(rootFreq: number, delay = 0, duration = 8) {
    const harmonics = [1, 2, 3, 4, 5, 6, 7, 8]
    const vols =      [0.12, 0.09, 0.07, 0.05, 0.04, 0.03, 0.02, 0.01]
    harmonics.forEach((h, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const vibrato = this.ctx.createOscillator()
      const vibratoGain = this.ctx.createGain()
      vibrato.connect(vibratoGain); vibratoGain.connect(osc.frequency)
      osc.connect(gain); gain.connect(this.master)
      osc.type = 'sine'
      osc.frequency.value = rootFreq * h
      vibrato.type = 'sine'
      vibrato.frequency.value = 4 + i * 0.3
      vibratoGain.gain.value = 2 + i
      gain.gain.setValueAtTime(0, this.now() + delay + i * 0.15)
      gain.gain.linearRampToValueAtTime(vols[i], this.now() + delay + i * 0.15 + 1.5)
      gain.gain.linearRampToValueAtTime(vols[i] * 0.7, this.now() + delay + duration - 1)
      gain.gain.linearRampToValueAtTime(0, this.now() + delay + duration)
      vibrato.start(this.now() + delay)
      osc.start(this.now() + delay + i * 0.15)
      vibrato.stop(this.now() + delay + duration)
      osc.stop(this.now() + delay + duration)
    })
  }

  // Transcendence chord — massive layered ascension
  transcendenceChord(delay = 0) {
    // Chord: Am → F → C → G (ascending emotional arc)
    const chords = [
      [220, 261.6, 329.6, 440],
      [174.6, 220, 261.6, 349.2],
      [261.6, 329.6, 392, 523.2],
      [196, 246.9, 293.6, 392],
    ]
    chords.forEach((chord, ci) => {
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        const reverb = this.ctx.createConvolver()
        osc.connect(gain); gain.connect(this.master)
        osc.type = 'sine'
        osc.frequency.value = freq
        const chordDelay = ci * 1.8
        gain.gain.setValueAtTime(0, this.now() + delay + chordDelay)
        gain.gain.linearRampToValueAtTime(0.06, this.now() + delay + chordDelay + 0.5)
        gain.gain.linearRampToValueAtTime(0.04, this.now() + delay + chordDelay + 1.5)
        gain.gain.linearRampToValueAtTime(0, this.now() + delay + chordDelay + 2.2)
        osc.start(this.now() + delay + chordDelay)
        osc.stop(this.now() + delay + chordDelay + 2.5)
      })
    })
  }

  // Glorious swell — everything harmonizes
  gloriousSwell(delay = 0) {
    // Perfect fifth stack — feels divine
    const freqs = [55, 82.4, 110, 164.8, 220, 329.6, 440, 659.2, 880]
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.connect(gain); gain.connect(this.master)
      osc.type = i < 3 ? 'sawtooth' : 'sine'
      osc.frequency.setValueAtTime(freq * 0.98, this.now() + delay)
      osc.frequency.linearRampToValueAtTime(freq, this.now() + delay + 2)
      const vol = 0.08 / (i * 0.5 + 1)
      gain.gain.setValueAtTime(0, this.now() + delay + i * 0.1)
      gain.gain.linearRampToValueAtTime(vol, this.now() + delay + i * 0.1 + 2)
      gain.gain.linearRampToValueAtTime(vol * 1.3, this.now() + delay + 4)
      gain.gain.linearRampToValueAtTime(0, this.now() + delay + 7)
      osc.start(this.now() + delay + i * 0.1)
      osc.stop(this.now() + delay + 8)
    })
  }

  // Divine resolution — single perfect tone
  divineResolution(delay = 0) {
    const freqs = [110, 220, 440, 880, 1760]
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.connect(gain); gain.connect(this.master)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, this.now() + delay)
      gain.gain.linearRampToValueAtTime(0.1 / (i + 1), this.now() + delay + 1)
      gain.gain.linearRampToValueAtTime(0, this.now() + delay + 4)
      osc.start(this.now() + delay)
      osc.stop(this.now() + delay + 4)
    })
  }

  // Single letter transcendence hit
  letterTranscend(index: number) {
    const rootFreqs = [220, 246.9, 261.6, 293.6, 329.6]
    const freq = rootFreqs[index]
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.connect(gain); gain.connect(this.master)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq * 2, this.now())
    osc.frequency.exponentialRampToValueAtTime(freq, this.now() + 0.3)
    gain.gain.setValueAtTime(0.18, this.now())
    gain.gain.exponentialRampToValueAtTime(0.001, this.now() + 1.2)
    osc.start(this.now()); osc.stop(this.now() + 1.2)

    // Shimmer layer
    const osc2 = this.ctx.createOscillator()
    const gain2 = this.ctx.createGain()
    osc2.connect(gain2); gain2.connect(this.master)
    osc2.type = 'sine'
    osc2.frequency.value = freq * 3
    gain2.gain.setValueAtTime(0.06, this.now())
    gain2.gain.exponentialRampToValueAtTime(0.001, this.now() + 0.8)
    osc2.start(this.now()); osc2.stop(this.now() + 0.8)
  }

  // Type click — alien data pulse
  typeClick() {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.connect(gain); gain.connect(this.master)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, this.now())
    osc.frequency.exponentialRampToValueAtTime(400, this.now() + 0.04)
    gain.gain.setValueAtTime(0.06, this.now())
    gain.gain.exponentialRampToValueAtTime(0.001, this.now() + 0.04)
    osc.start(this.now()); osc.stop(this.now() + 0.04)
  }

  // Master sequence
  startSequence() {
    // Phase 1 — Alien arrival (0-7s)
    this.alienDrone(40, 7, 0.15, 0)
    this.alienDrone(55, 6, 0.1, 0.5)
    this.dissonantTone(120, 0, 6)
    this.warpSignal(1)
    this.warpSignal(3)

    // Phase 2 — Machine choir builds (7-14s)
    setTimeout(() => this.machineChoir(110, 0, 10), 7000)
    setTimeout(() => this.machineChoir(55, 1, 9), 7500)

    // Phase 3 — Transcendence chord progression (12-20s)
    setTimeout(() => this.transcendenceChord(0), 12000)

    // Phase 4 — Glorious swell (17-24s)
    setTimeout(() => this.gloriousSwell(0), 17000)

    // Phase 5 — Divine resolution (21-25s)
    setTimeout(() => this.divineResolution(0), 21000)
  }

  triggerLetterTranscend(index: number) {
    this.letterTranscend(index)
  }

  triggerTypeClick() {
    this.typeClick()
  }
}

export default function Preloader({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<GesnaAudio | null>(null)
  const [phase, setPhase] = useState(0)
  const [typedLines, setTypedLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState('')
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [showLogo, setShowLogo] = useState(false)
  const [logoGlow, setLogoGlow] = useState(false)
  const [showSystem, setShowSystem] = useState(false)
  const [showReady, setShowReady] = useState(false)
  const [exit, setExit] = useState(false)
  const [audioStarted, setAudioStarted] = useState(false)

  const startAudio = () => {
    if (audioStarted) return
    setAudioStarted(true)
    const audio = new GesnaAudio()
    audioRef.current = audio
    audio.startSequence()
  }

  // Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const hexSize = 32
    const cols = Math.ceil(canvas.width / (hexSize * 1.75)) + 2
    const rows = Math.ceil(canvas.height / (hexSize * 1.5)) + 2
    let animId: number
    let startTime = Date.now()

    const hexPath = (x: number, y: number, size: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const px = x + size * Math.cos(angle)
        const py = y + size * Math.sin(angle)
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    const draw = () => {
      const elapsed = (Date.now() - startTime) / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(0, y, canvas.width, 1)
      }

      const expandProgress = Math.min(Math.max((elapsed - 7) / 6, 0), 1)
      const cx = canvas.width / 2
      const cy = canvas.height / 2

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * hexSize * 1.75
          const y = r * hexSize * 1.5 + (c % 2 === 0 ? 0 : hexSize * 0.75)
          const dist = Math.hypot(x - cx, y - cy)
          const maxDist = Math.hypot(cx, cy)
          const revealRadius = expandProgress * maxDist * 1.2
          if (dist > revealRadius) continue
          const opacity = Math.min((revealRadius - dist) / (maxDist * 0.3), 0.6)
          const pulse = Math.sin(elapsed * 2 + dist * 0.01) * 0.5 + 0.5
          hexPath(x, y, hexSize * 0.45)
          ctx.strokeStyle = `rgba(0, 245, 255, ${opacity * 0.3 * pulse})`
          ctx.lineWidth = 0.5
          ctx.stroke()
          if (Math.random() < 0.001) {
            ctx.fillStyle = `rgba(0, 245, 255, ${opacity * 0.15})`
            ctx.fill()
          }
        }
      }

      const particleCount = 80
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 137.5
        const px = ((seed * 31.7 + elapsed * (10 + i % 20)) % canvas.width)
        const py = ((seed * 17.3 + elapsed * (5 + i % 10)) % canvas.height)
        const size = (i % 3) + 1
        const alpha = (Math.sin(elapsed * 2 + i) * 0.5 + 0.5) * 0.7
        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fillStyle = i % 3 === 0
          ? `rgba(0,245,255,${alpha})`
          : i % 3 === 1
          ? `rgba(123,47,255,${alpha})`
          : `rgba(255,215,0,${alpha})`
        ctx.fill()
      }

      // Alien pulse rings from center (phase 3+)
      if (elapsed > 12) {
        const ringProgress = (elapsed - 12) / 12
        for (let r = 0; r < 4; r++) {
          const ringRadius = ((ringProgress * 800 + r * 200) % 800)
          const ringAlpha = Math.max(0, 1 - ringRadius / 800) * 0.4
          ctx.beginPath()
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(123,47,255,${ringAlpha})`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      }

      if (elapsed < 7) {
        const glitchIntensity = Math.max(0, 1 - elapsed / 7)
        if (Math.random() < glitchIntensity * 0.4) {
          const glitchY = Math.random() * canvas.height
          const glitchH = Math.random() * 10 + 2
          ctx.fillStyle = `rgba(0,245,255,${Math.random() * 0.12})`
          ctx.fillRect(0, glitchY, canvas.width, glitchH)
          // Horizontal glitch shift
          if (Math.random() < 0.3) {
            const sliceY = Math.random() * canvas.height
            const sliceH = Math.random() * 30 + 5
            const shift = (Math.random() - 0.5) * 30
            const imageData = ctx.getImageData(0, sliceY, canvas.width, sliceH)
            ctx.putImageData(imageData, shift, sliceY)
          }
        }
      }

      const vignette = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cx, cy))
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(0.5, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, 'rgba(0,0,0,0.9)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  // Phase timeline
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => { setPhase(2); setShowLogo(true) }, 7000),
      setTimeout(() => setLogoGlow(true), 9000),
      setTimeout(() => { setPhase(3); setShowSystem(true) }, 14000),
      setTimeout(() => setShowReady(true), 20000),
      setTimeout(() => setExit(true), 23500),
      setTimeout(() => onComplete(), 25000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  // Typewriter
  useEffect(() => {
    if (!showSystem) return
    if (lineIndex >= SYSTEM_LINES.length) return
    const line = SYSTEM_LINES[lineIndex]
    if (charIndex < line.length) {
      const t = setTimeout(() => {
        setCurrentLine(prev => prev + line[charIndex])
        setCharIndex(c => c + 1)
        audioRef.current?.triggerTypeClick()
      }, 45)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setTypedLines(prev => [...prev, line])
        setCurrentLine('')
        setCharIndex(0)
        setLineIndex(l => l + 1)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [showSystem, lineIndex, charIndex])

  return (
    <AnimatePresence>
      {!exit ? (
        <motion.div
          key="preloader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ exit: { duration: 1.5 } }}
          onClick={startAudio}
          style={{
            position: 'fixed', inset: 0,
            background: 'var(--bg-void)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            overflow: 'hidden',
            cursor: 'default',
          }}
        >
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

          {/* Scan sweep */}
          {phase >= 1 && (
            <motion.div
              initial={{ top: '-2px' }}
              animate={{ top: '100vh' }}
              transition={{ duration: 3, ease: 'linear', repeat: Infinity, repeatDelay: 5 }}
              style={{
                position: 'absolute', left: 0, right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--g-purple), var(--g-cyan), transparent)',
                boxShadow: '0 0 30px var(--g-cyan), 0 0 60px var(--g-purple)',
                zIndex: 2,
              }}
            />
          )}

          {/* Audio prompt */}
          {!audioStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                bottom: '2rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'rgba(0,245,255,0.5)',
                letterSpacing: '0.3em',
                zIndex: 4,
              }}
            >
              CLICK ANYWHERE TO ENABLE AUDIO
            </motion.div>
          )}

          <div style={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>

            {/* Logo */}
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.3, filter: 'blur(40px)' }}
                  animate={{ opacity: 1, scale: 1, filter: logoGlow ? 'blur(0px)' : 'blur(12px)' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{ marginBottom: '2rem' }}
                >
                  {'GESNA'.split('').map((letter, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: -60, filter: 'blur(20px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: i * 0.15, duration: 0.7, ease: 'easeOut' }}
                      onAnimationComplete={() => audioRef.current?.triggerLetterTranscend(i)}
                      style={{
                        display: 'inline-block',
                        fontSize: 'clamp(4rem, 10vw, 8rem)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        letterSpacing: '0.3em',
                        color: logoGlow ? 'var(--g-cyan)' : '#fff',
                        textShadow: logoGlow
                          ? '0 0 40px var(--g-cyan), 0 0 80px var(--g-cyan), 0 0 160px rgba(0,245,255,0.4), 0 0 200px rgba(123,47,255,0.3)'
                          : 'none',
                        transition: 'color 1.5s, text-shadow 1.5s',
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtitle */}
            {logoGlow && (
              <motion.p
                initial={{ opacity: 0, letterSpacing: '1em' }}
                animate={{ opacity: 0.7, letterSpacing: '0.4em' }}
                transition={{ duration: 2 }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--g-cyan)',
                  textTransform: 'uppercase',
                  marginBottom: '3rem',
                }}
              >
                Solana DEX Aggregator
              </motion.p>
            )}

            {/* System lines */}
            {showSystem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  textAlign: 'left',
                  display: 'inline-block',
                  minWidth: '320px',
                }}
              >
                {typedLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ color: 'var(--g-green)', marginBottom: '8px' }}
                  >
                    <span style={{ color: 'rgba(0,245,255,0.4)', marginRight: '8px' }}>&gt;</span>
                    {line}
                    <span style={{ color: 'var(--g-green)', marginLeft: '8px' }}>✓</span>
                  </motion.div>
                ))}
                {lineIndex < SYSTEM_LINES.length && (
                  <div style={{ color: 'var(--g-cyan)', marginBottom: '8px' }}>
                    <span style={{ color: 'rgba(0,245,255,0.4)', marginRight: '8px' }}>&gt;</span>
                    {currentLine}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ borderRight: '2px solid var(--g-cyan)', marginLeft: '2px' }}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Ready */}
            {showReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                  marginTop: '2.5rem',
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  letterSpacing: '0.6em',
                  color: 'var(--g-gold)',
                  textShadow: '0 0 40px var(--g-gold), 0 0 80px rgba(255,215,0,0.4)',
                  textTransform: 'uppercase',
                }}
              >
                 SYSTEM READY 👌👌👌
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}