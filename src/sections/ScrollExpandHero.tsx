import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const isMobileDevice = () => typeof window !== 'undefined' && window.innerWidth < 768

const BG_VIDEO     = '/bsm/15606983_3840_2160_30fps.mp4'
const EXPAND_VIDEO = '/bsm/istockphoto-1704201625-640_adpp_is.mp4'
const G_PROGRESS   = 'linear-gradient(to right, #4a3400, #ffe680, #4a3400)'

export default function ScrollExpandHero() {
  const { lang } = useLanguage()

  // ── Refs (no re-renders on scroll) ──────────────────────────────
  const progressRef      = useRef(0)
  const expandedRef      = useRef(false)
  const touchStartRef    = useRef(0)
  const mobileRef        = useRef(false)
  const rafRef           = useRef<number | undefined>(undefined)

  // DOM refs — manipulated directly for zero-jank animation
  const bgRef            = useRef<HTMLDivElement>(null)
  const videoBoxRef      = useRef<HTMLDivElement>(null)
  const videoOverlayRef  = useRef<HTMLDivElement>(null)
  const progressBarRef   = useRef<HTMLDivElement>(null)
  const textWrapRef      = useRef<HTMLDivElement>(null)
  const line1Ref         = useRef<HTMLDivElement>(null)
  const line2Ref         = useRef<HTMLDivElement>(null)
  const subRef           = useRef<HTMLDivElement>(null)
  const hintRef          = useRef<HTMLDivElement>(null)
  // Video element refs — for mobile autoplay recovery
  const bgVideoRef       = useRef<HTMLVideoElement>(null)
  const expandVideoRef   = useRef<HTMLVideoElement>(null)

  // Only ONE piece of React state — for letting normal scroll start
  const [, setFullyExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(isMobileDevice)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Resize ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => { mobileRef.current = window.innerWidth < 768 }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── DOM update (runs inside rAF, no React involved) ─────────────
  const applyProgress = (p: number) => {
    const mob = mobileRef.current
    const mW  = mob ? 240 + p * 510 : 300 + p * 1250
    const mH  = mob ? 320 + p * 180 : 400 + p * 400
    const tx  = p * (mob ? 180 : 150)

    if (bgRef.current)
      bgRef.current.style.opacity = String(Math.max(0, 1 - p * 1.8))

    if (videoBoxRef.current) {
      const el = videoBoxRef.current
      el.style.width  = `${Math.min(mW, window.innerWidth * 0.96)}px`
      el.style.height = `${Math.min(mH, window.innerHeight * 0.88)}px`
      el.style.borderColor = p < 0.94
        ? `rgba(212,175,55,${Math.max(0, 0.4 - p * 0.35)})`
        : 'transparent'
    }

    if (videoOverlayRef.current)
      videoOverlayRef.current.style.opacity = String(Math.max(0, 0.55 - p * 0.55))

    if (progressBarRef.current)
      progressBarRef.current.style.transform = `scaleX(${p})`

    if (textWrapRef.current)
      textWrapRef.current.style.opacity = String(Math.max(0, 1 - p * 2.5))

    if (line1Ref.current)
      line1Ref.current.style.transform = `translateX(-${tx}vw)`

    if (line2Ref.current)
      line2Ref.current.style.transform = `translateX(${tx}vw)`

    if (subRef.current)
      subRef.current.style.transform = `translateX(-${tx * 0.4}vw)`

    if (hintRef.current)
      hintRef.current.style.opacity = String(
        p < 0.12 ? 1 : Math.max(0, 1 - (p - 0.12) * 12)
      )
  }

  // ── Video autoplay recovery ─────────────────────────────────────
  useEffect(() => {
    const tryPlay = () => {
      const bg = bgVideoRef.current
      const exp = expandVideoRef.current
      if (bg?.paused)  bg.play().catch(() => {})
      if (exp?.paused) exp.play().catch(() => {})
    }

    // Fire on tab/app visibility changes — also force-reload if video is stuck
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const bg  = bgVideoRef.current
        const exp = expandVideoRef.current
        // If video is stuck (readyState 0 or networkState NETWORK_NO_SOURCE), reload src
        const revive = (v: HTMLVideoElement | null) => {
          if (!v) return
          if (v.readyState === 0 || v.networkState === 3) {
            const s = v.src; v.src = ''; v.src = s
          }
          v.play().catch(() => {})
        }
        revive(bg)
        revive(exp)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', tryPlay)
    window.addEventListener('pageshow', tryPlay)

    // Direct pause listener — catches immediate browser-imposed pauses
    const onPause = () => { setTimeout(tryPlay, 80) }
    bgVideoRef.current?.addEventListener('pause', onPause)
    expandVideoRef.current?.addEventListener('pause', onPause)

    // Interval fallback — in case timers are throttled, still checks periodically
    const interval = setInterval(tryPlay, 2000)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', tryPlay)
      window.removeEventListener('pageshow', tryPlay)
      bgVideoRef.current?.removeEventListener('pause', onPause)
      expandVideoRef.current?.removeEventListener('pause', onPause)
      clearInterval(interval)
    }
  }, [])

  // ── Scroll interception ─────────────────────────────────────────
  useEffect(() => {
    const advance = (delta: number) => {
      const next = Math.min(Math.max(progressRef.current + delta, 0), 1)
      progressRef.current = next

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => applyProgress(next))

      // Fully expanded
      if (next >= 1 && !expandedRef.current) {
        expandedRef.current = true
        setFullyExpanded(true)
      }
      // Fully collapsed — reset visual state
      if (next <= 0 && expandedRef.current) {
        expandedRef.current = false
        setFullyExpanded(false)
      }
    }

    const onWheel = (e: WheelEvent) => {
      // Scrolling up while expanded and at top → collapse gradually
      if (expandedRef.current && e.deltaY < 0 && window.scrollY <= 5) {
        e.preventDefault()
        advance(e.deltaY * 0.0009)
        return
      }
      if (!expandedRef.current) {
        e.preventDefault()
        advance(e.deltaY * 0.0009)
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      const startY = touchStartRef.current
      if (!startY) return
      const dy = startY - e.touches[0].clientY

      // Swiping up while expanded and at top → collapse gradually
      if (expandedRef.current && window.scrollY === 0 && dy < 0) {
        e.preventDefault()
        advance(dy * 0.008)
        touchStartRef.current = e.touches[0].clientY
        return
      }
      if (!expandedRef.current) {
        e.preventDefault()
        advance(dy * (dy < 0 ? 0.008 : 0.005))
        touchStartRef.current = e.touches[0].clientY
      }
    }

    const onTouchEnd = () => { touchStartRef.current = 0 }
    const onScroll   = () => { if (!expandedRef.current) window.scrollTo(0, 0) }

    const onResetHero = () => {
      progressRef.current = 0
      expandedRef.current = false
      setFullyExpanded(false)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => applyProgress(0))
    }

    const onExpandHero = () => {
      progressRef.current = 1
      expandedRef.current = true
      setFullyExpanded(true)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => applyProgress(1))
    }

    window.addEventListener('wheel',           onWheel,      { passive: false })
    window.addEventListener('scroll',          onScroll)
    window.addEventListener('touchstart',      onTouchStart, { passive: false })
    window.addEventListener('touchmove',       onTouchMove,  { passive: false })
    window.addEventListener('touchend',        onTouchEnd)
    window.addEventListener('flaash-reset-hero',  onResetHero)
    window.addEventListener('flaash-expand-hero', onExpandHero)

    return () => {
      window.removeEventListener('wheel',           onWheel)
      window.removeEventListener('scroll',          onScroll)
      window.removeEventListener('touchstart',      onTouchStart)
      window.removeEventListener('touchmove',       onTouchMove)
      window.removeEventListener('touchend',        onTouchEnd)
      window.removeEventListener('flaash-reset-hero',  onResetHero)
      window.removeEventListener('flaash-expand-hero', onExpandHero)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, []) // empty deps — all values read from refs

  const line1 = 'FLAASH'
  const line2 = lang === 'es' ? 'Minorista & Mayorista' : 'Retail & Wholesale'
  const sub   = lang === 'es' ? 'Conectando mercados globales' : 'Connecting global markets'
  const hint  = lang === 'es' ? 'Desplazá para expandir' : 'Scroll to expand'

  return (
    <>
      {/* ── Gold progress bar ── */}
      <div className="fixed left-0 w-full z-50"
        style={{ top: 0, height: 2, background: 'rgba(255,255,255,0.06)' }}>
        <div ref={progressBarRef} style={{
          height: '100%',
          background: G_PROGRESS,
          transform: 'scaleX(0)',
          transformOrigin: 'left center',
          willChange: 'transform',
        }} />
      </div>

      {/* ── Hero ── */}
      <div style={{ background: '#0C0C0C', overflow: 'hidden' }}>
        <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Background video */}
          <div ref={bgRef} style={{
            position: 'absolute', inset: 0, zIndex: 0,
            willChange: 'opacity',
            transform: 'translateZ(0)',
          }}>
            <video ref={bgVideoRef} src={BG_VIDEO} autoPlay muted loop playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,4,0.06)' }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
              background: 'linear-gradient(to top, rgba(212,175,55,0.07), transparent)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, width: '100%', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* Expanding video box */}
            <div ref={videoBoxRef} style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(240px, 64vw, 300px)', height: 'clamp(320px, 85vw, 400px)',
              maxWidth: '96vw', maxHeight: '88vh',
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(212,175,55,0.4)',
              boxShadow: '0 0 80px rgba(212,175,55,0.15), 0 0 200px rgba(0,0,0,0.6)',
              willChange: 'width, height',
            }}>
              <video ref={expandVideoRef} src={EXPAND_VIDEO} autoPlay muted loop playsInline preload="auto"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div ref={videoOverlayRef} style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                willChange: 'opacity',
              }} />
            </div>

            {/* Title text */}
            <div ref={textWrapRef} style={{
              position: 'relative', zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', gap: isMobile ? 14 : 20,
              pointerEvents: 'none', userSelect: 'none',
              willChange: 'opacity',
              maxWidth: isMobile ? '220px' : 'none',
            }}>
              <div ref={line1Ref} className="hero-heading"
                style={{
                  fontSize: isMobile ? '3.5rem' : 'clamp(5rem, 16vw, 160px)',
                  fontWeight: 900, lineHeight: 1,
                  letterSpacing: '0.12em',
                  willChange: 'transform',
                }}>
                {line1}
              </div>
              <div ref={line2Ref} className="hero-heading"
                style={{
                  fontSize: isMobile ? '1.05rem' : 'clamp(1.4rem, 4.5vw, 56px)',
                  fontWeight: 800, lineHeight: 1,
                  letterSpacing: isMobile ? '0.12em' : '0.18em',
                  textTransform: 'uppercase',
                  willChange: 'transform',
                }}>
                {line2}
              </div>
              <div ref={subRef}
                style={{
                  fontSize: isMobile ? '0.58rem' : 'clamp(0.7rem, 1.3vw, 0.95rem)',
                  fontWeight: 700, letterSpacing: isMobile ? '0.18em' : '0.35em',
                  textTransform: 'uppercase', marginTop: 4,
                  color: '#FFFFFF',
                  textShadow: '0 1px 10px rgba(0,0,0,0.75), 0 0 30px rgba(0,0,0,0.4)',
                  willChange: 'transform',
                }}>
                {sub}
              </div>
            </div>

            {/* Scroll hint */}
            <div ref={hintRef} style={{
              position: 'absolute', bottom: 40,
              left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              zIndex: 20, pointerEvents: 'none',
              willChange: 'opacity',
            }}>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase',
                color: '#FFFFFF',
                textShadow: '0 1px 8px rgba(0,0,0,0.7)',
              }}>
                {hint}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF"
                strokeWidth={1.5} strokeLinecap="round"
                style={{ width: 22, height: 22, animation: 'bounce 1.5s infinite', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))' }}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>

          </div>
        </section>
      </div>
    </>
  )
}
