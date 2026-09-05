import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Globe from '@/components/ui/globe'
import { cn } from '@/lib/utils'
import { useLanguage } from '../contexts/LanguageContext'

const G_BAR  = 'linear-gradient(to right, #4a3400, #ffe680, #4a3400)'
const G_FULL = 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)'

const C = {
  bg: '#0C0C0C',
  text: '#F5F0E8',
  textMuted: 'rgba(245,240,232,0.65)',
  textDim: 'rgba(245,240,232,0.4)',
  gold: '#D4AF37',
  goldGlow: 'rgba(212,175,55,0.25)',
  cardBg: 'rgba(212,175,55,0.04)',
  cardBorder: 'rgba(212,175,55,0.18)',
  dotBorder: 'rgba(212,175,55,0.35)',
}

interface Section {
  id: string
  badge?: string
  title: string
  subtitle?: string
  description: string
  align?: 'left' | 'center' | 'right'
  features?: { title: string; description: string }[]
  actions?: { label: string; variant: 'primary' | 'secondary'; href?: string; scrollTo?: string }[]
}

interface GlobePos { top: string; left: string; scale: number }
interface Props { sections: Section[]; globeConfig?: { positions: GlobePos[] }; className?: string }

const defaultGlobeConfig = {
  positions: [
    { top: '50%', left: '72%', scale: 1.75 },
    { top: '25%', left: '58%', scale: 1.1  },
    { top: '15%', left: '80%', scale: 2.0  },
    { top: '50%', left: '56%', scale: 1.85 },
  ],
}

const pct = (s: string) => parseFloat(s)

function ScrollGlobe({ sections, globeConfig = defaultGlobeConfig, className }: Props) {
  const [activeSection, setActiveSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [globeTransform, setGlobeTransform] = useState('')
  const [globeOpacity, setGlobeOpacity] = useState(0.88)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const rafRef = useRef<number | undefined>(undefined)

  const positions = useMemo(
    () => globeConfig.positions.map((p) => ({ top: pct(p.top), left: pct(p.left), scale: p.scale })),
    [globeConfig.positions]
  )

  const update = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const scrollTop = window.pageYOffset
    const containerH = el.scrollHeight - window.innerHeight
    const progress = Math.min(Math.max((scrollTop - el.offsetTop) / Math.max(containerH, 1), 0), 1)
    setScrollProgress(progress)

    // Fade globe out as user approaches end of section
    const fadeStart = el.offsetTop + el.scrollHeight - window.innerHeight * 1.2
    if (scrollTop > fadeStart) {
      const fadeProgress = (scrollTop - fadeStart) / (window.innerHeight * 0.5)
      setGlobeOpacity(Math.max(0, 0.88 - fadeProgress))
    } else {
      setGlobeOpacity(activeSection === 3 ? 0.45 : 0.88)
    }

    const mid = window.innerHeight / 2
    let newActive = 0, minDist = Infinity
    sectionRefs.current.forEach((ref, i) => {
      if (!ref) return
      const { top, height } = ref.getBoundingClientRect()
      const dist = Math.abs(top + height / 2 - mid)
      if (dist < minDist) { minDist = dist; newActive = i }
    })

    const pos = positions[newActive]
    setGlobeTransform(`translate3d(${pos.left}vw,${pos.top}vh,0) translate3d(-50%,-50%,0) scale3d(${pos.scale},${pos.scale},1)`)
    setActiveSection(newActive)
  }, [positions, activeSection])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => { update(); ticking = false })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => { window.removeEventListener('scroll', onScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [update])

  useEffect(() => {
    const pos = positions[0]
    setGlobeTransform(`translate3d(${pos.left}vw,${pos.top}vh,0) translate3d(-50%,-50%,0) scale3d(${pos.scale},${pos.scale},1)`)
  }, [positions])

  const handleActionClick = (action: { label: string; variant: 'primary' | 'secondary'; href?: string; scrollTo?: string }) => {
    if (action.scrollTo) {
      const el = document.getElementById(action.scrollTo)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full overflow-x-hidden', className)} style={{ background: C.bg }}>

      {/* Progress bar */}
      <div className="fixed left-0 w-full h-0.5 z-40" style={{ top: 0, background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full will-change-transform" style={{
          background: G_BAR,
          transform: `scaleX(${scrollProgress})`,
          transformOrigin: 'left center',
          transition: 'transform 0.15s ease-out',
        }} />
      </div>

      {/* Side nav dots */}
      <div className="hidden sm:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-4 lg:gap-6"
        style={{ opacity: globeOpacity > 0.1 ? 1 : 0, transition: 'opacity 0.5s ease-out' }}>
        {sections.map((section, index) => (
          <div key={index} className="relative flex items-center justify-end">
            <div
              className={cn('absolute right-6 lg:right-8 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border',
                activeSection === index ? 'animate-fadeOut' : 'opacity-0 pointer-events-none')}
              style={{ background: 'rgba(12,12,12,0.97)', borderColor: C.cardBorder, color: C.text }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.gold }} />
                <span>{section.badge ?? `Section ${index + 1}`}</span>
              </div>
            </div>
            <button
              onClick={() => sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="relative w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full border-2 transition-all duration-300 hover:scale-125 cursor-pointer"
              style={activeSection === index
                ? { background: C.gold, borderColor: C.gold, boxShadow: `0 0 10px ${C.goldGlow}` }
                : { background: 'transparent', borderColor: C.dotBorder }}
              aria-label={`Go to ${section.badge ?? `section ${index + 1}`}`}
            />
          </div>
        ))}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 -z-10"
          style={{ background: `linear-gradient(to bottom, transparent, ${C.goldGlow}, transparent)` }} />
      </div>

      {/* Fixed globe — fades out when scrolled past section */}
      <div
        className="fixed z-10 pointer-events-none will-change-transform"
        style={{
          transform: globeTransform,
          opacity: globeOpacity,
          transition: 'opacity 0.6s ease-out, transform 1400ms cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        <div className="relative scale-90 sm:scale-100 lg:scale-110">
          <Globe />
        </div>
      </div>

      {/* Content sections */}
      {sections.map((section, index) => (
        <section
          key={section.id}
          ref={(el) => { sectionRefs.current[index] = el as HTMLElement | null }}
          className={cn(
            'relative min-h-screen flex flex-col justify-center z-20',
            'px-6 sm:px-10 md:px-14 lg:px-16 py-24 sm:py-28',
            'w-full overflow-hidden',
            section.align === 'center' && 'items-center text-center',
            section.align === 'right'  && 'items-end text-right',
            (!section.align || section.align === 'left') && 'items-start text-left'
          )}
        >
          <div className="w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl">

            <h1 className={cn('font-bold mb-5 sm:mb-7 leading-[1.05] tracking-tight',
              index === 0 ? 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl'
                         : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl')}>
              {index === 0 && section.subtitle ? (
                <div>
                  <div className="hero-heading">{section.title}</div>
                  <div style={{ marginTop: '1rem', display: 'inline-block' }}>
                    <span
                      className="gold-chrome-text"
                      style={{
                        display: 'inline-block',
                        fontSize: 'clamp(1rem, 2vw, 1.35rem)',
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        lineHeight: 1.4,
                      }}
                    >
                      {section.subtitle}
                    </span>
                  </div>
                </div>
              ) : section.subtitle ? (
                <div>
                  <div className="hero-heading">{section.title}</div>
                  <div className="hero-heading">{section.subtitle}</div>
                </div>
              ) : (
                <div className="hero-heading">{section.title}</div>
              )}
            </h1>

            <p className="leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg font-light" style={{ color: C.textMuted }}>
              {section.description}
            </p>


            {section.features && (
              <div className="grid gap-3 mb-8">
                {section.features.map((feat) => (
                  <div key={feat.title} className="p-4 sm:p-5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: C.gold }} />
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base mb-1" style={{ color: C.text }}>{feat.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{feat.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.actions && (
              <div className={cn('flex flex-col sm:flex-row flex-wrap gap-3',
                section.align === 'center' && 'justify-center',
                section.align === 'right'  && 'justify-end',
                (!section.align || section.align === 'left') && 'justify-start')}>
                {section.actions.map((action) => (
                  action.scrollTo ? (
                    <button
                      key={action.label}
                      onClick={() => handleActionClick(action)}
                      className="px-7 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer text-center w-full sm:w-auto"
                      style={action.variant === 'primary'
                        ? { background: G_FULL, color: '#0C0C0C', outline: '2px solid rgba(212,175,55,0.4)', outlineOffset: '-3px', fontWeight: 700 }
                        : { background: 'transparent', color: '#F5F0E8', border: '2px solid rgba(212,175,55,0.18)' }}
                    >
                      {action.label}
                    </button>
                  ) : (
                    <a
                      key={action.label}
                      href={action.href ?? '#'}
                      target={action.href?.startsWith('http') ? '_blank' : undefined}
                      rel={action.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="px-7 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer text-center w-full sm:w-auto"
                      style={action.variant === 'primary'
                        ? { background: G_FULL, color: '#0C0C0C', outline: '2px solid rgba(212,175,55,0.4)', outlineOffset: '-3px', fontWeight: 700 }
                        : { background: 'transparent', color: '#F5F0E8', border: '2px solid rgba(212,175,55,0.18)' }}
                    >
                      {action.label}
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

export default function HeroScrollSection() {
  const { t } = useLanguage()
  return <ScrollGlobe sections={t.hero as unknown as Section[]} />
}
