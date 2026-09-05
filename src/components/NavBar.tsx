import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useCart } from '../contexts/CartContext'

/* ─── Color system ─── */
const G_BAR    = 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)'
const TEXT_MUTED   = 'rgba(12,12,12,0.58)'
const TEXT_PRIMARY = '#0C0C0C'
const NAV_GOLD       = '#D4AF37'   // base dorado
const NAV_GOLD_SHINE = '#FFE9A8'   // brillo al hover

const applyGold = (el: HTMLElement) => {
  el.style.webkitTextFillColor = NAV_GOLD_SHINE
  el.style.color = NAV_GOLD_SHINE
  el.style.background = ''
  el.style.webkitBackgroundClip = ''
  el.style.backgroundClip = ''
}
const removeGold = (el: HTMLElement, fallback = NAV_GOLD) => {
  el.style.webkitTextFillColor = fallback
  el.style.color = fallback
  el.style.background = ''
  el.style.webkitBackgroundClip = ''
  el.style.backgroundClip = ''
}

const toSlug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')

/* ─── Fixed slugs (language-independent) ─── */
const IMPORT_SLUGS = [
  'electronics','tools-hardware','home-decor','bathrooms-sanitary',
  'outdoor-garden','automotive','appliances','clothing-footwear',
  'toys','sports-equipment','lighting','beauty-personal-care',
  'pets-animals','health-wellness','smart-home','other-categories',
]
const EXPORT_SLUGS = [
  'premium-wines','craft-gin','tequila-reposado',
  'alfajores','fertilizers',
]

/* ─── Icons ─── */
const HouseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const ChevronRight = ({ size = 4 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={`w-${size} h-${size} flex-shrink-0`}>
    <path d="M9 18l6-6-6-6" />
  </svg>
)
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
    <path d="M19 9l-7 7-7-7" />
  </svg>
)
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

function CartButton({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { count } = useCart()
  const navigate = useNavigate()
  const size = variant === 'desktop' ? 'w-9 h-9' : 'w-8 h-8'
  const [bounce, setBounce] = useState(false)
  const prevCount = useRef(count)

  useEffect(() => {
    if (count > prevCount.current) {
      setBounce(true)
      const timer = setTimeout(() => setBounce(false), 550)
      prevCount.current = count
      return () => clearTimeout(timer)
    }
    prevCount.current = count
  }, [count])

  return (
    <button onClick={() => navigate('/cart')} aria-label="Carrito de compras"
      className={`relative flex items-center justify-center ${size} rounded-lg transition-colors duration-150 cursor-pointer`}
      style={{ color: NAV_GOLD }}
      onMouseEnter={e => applyGold(e.currentTarget)}
      onMouseLeave={e => removeGold(e.currentTarget)}
      onTouchStart={e => applyGold(e.currentTarget)}
      onTouchEnd={e => removeGold(e.currentTarget)}>
      <span className="inline-flex" style={{ animation: bounce ? 'cartBounce 0.55s cubic-bezier(0.36,0.07,0.19,0.97)' : 'none' }}>
        <CartIcon />
      </span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[9px] font-black"
          style={{
            minWidth: 16, height: 16, padding: '0 3px', background: '#D4AF37', color: '#0C0C0C',
            animation: bounce ? 'cartBadgePop 0.4s ease-out' : 'none',
          }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

/* ─── Desktop dropdown ─── */
function Dropdown({ items, slugs, basePath, cols = 1, onClose }:
  { items: string[]; slugs: string[]; basePath: string; cols?: 1 | 2; onClose: () => void }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-2xl shadow-2xl z-50 py-3"
      style={{ background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.2)',
        backdropFilter: 'blur(16px)', width: cols === 2 ? '400px' : '210px', maxHeight: '70vh', overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
      <div className={`grid gap-0.5 px-2 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {items.map((cat, i) => (
          <Link key={cat} to={`${basePath}#${slugs[i] ?? toSlug(cat)}`} onClick={onClose}
            className="text-xs px-3 py-2 rounded-lg transition-colors duration-150"
            style={{ color: TEXT_MUTED, lineHeight: '1.35' }}
            onMouseEnter={e => applyGold(e.currentTarget)}
            onMouseLeave={e => removeGold(e.currentTarget)}>
            {cat}
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ─── Desktop language dropdown ─── */
function LangDropdown({ onClose }: { onClose: () => void }) {
  const { lang, setLang } = useLanguage()
  return (
    <div className="absolute top-full right-0 mt-2 rounded-2xl shadow-2xl z-50 py-2"
      style={{ background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.2)',
        backdropFilter: 'blur(16px)', width: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
      {(['en', 'es'] as const).map(l => (
        <button key={l} onClick={() => { setLang(l); onClose() }}
          className="w-full text-left text-xs px-4 py-2.5 flex items-center gap-2.5 transition-colors duration-150 cursor-pointer"
          style={{ color: lang === l ? TEXT_PRIMARY : TEXT_MUTED, background: lang === l ? 'rgba(0,0,0,0.04)' : 'transparent' }}
          onMouseEnter={e => { if (lang !== l) applyGold(e.currentTarget) }}
          onMouseLeave={e => { if (lang !== l) removeGold(e.currentTarget) }}>
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>{l === 'en' ? '🇺🇸' : '🇲🇽'}</span>
          <span className="font-semibold uppercase tracking-wider">{l === 'en' ? 'English' : 'Español'}</span>
          {lang === l && (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 ml-auto flex-shrink-0" style={{ color: '#C8A028' }}>
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}

/* ─── Mobile drawer ─── */
function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, lang, setLang } = useLanguage()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<'import' | 'export' | null>(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const goTo = (path: string, hash?: string) => {
    onClose()
    setExpanded(null)
    navigate(path)
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 320)
  }

  const goContact = () => {
    onClose()
    setExpanded(null)
    if (window.location.pathname !== '/') {
      navigate('/')
      setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 320)
    } else {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] transition-opacity duration-300 sm:hidden"
        style={{ background: 'rgba(0,0,0,0.55)', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-[100] flex flex-col sm:hidden"
        style={{
          width: '88vw', maxWidth: 360,
          background: '#FFFFFF',
          borderLeft: '1px solid rgba(212,175,55,0.2)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)',
          overflowY: 'auto',
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(212,175,55,0.18)' }}>
          <span className="gold-chrome-text font-black uppercase tracking-widest text-lg">Flaash</span>
          <button onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all duration-150"
            style={{ color: TEXT_MUTED, border: '1px solid rgba(212,175,55,0.15)' }}
            onTouchStart={e => applyGold(e.currentTarget)}
            onTouchEnd={e => removeGold(e.currentTarget)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1">

          {/* PRODUCTS link */}
          <div style={{ borderBottom: '1px solid rgba(212,175,55,0.18)' }}>
            <button
              onClick={() => { onClose(); navigate('/productos') }}
              className="w-full text-left px-5 py-4 cursor-pointer transition-colors duration-150"
              style={{ color: NAV_GOLD }}
              onTouchStart={e => applyGold(e.currentTarget)}
              onTouchEnd={e => removeGold(e.currentTarget)}>
              <span className="text-base font-semibold uppercase tracking-wide">{t.nav.products}</span>
            </button>
          </div>

          {/* IMPORTS accordion */}
          <div style={{ borderBottom: '1px solid rgba(212,175,55,0.18)' }}>
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => { onClose(); setExpanded(null); navigate('/imports') }}
                className="flex-1 text-left px-5 py-4 cursor-pointer transition-colors duration-150"
                style={{ color: NAV_GOLD }}
              >
                <span className="text-base font-semibold uppercase tracking-wide">{t.nav.imports}</span>
              </button>
              <button
                onClick={() => setExpanded(expanded === 'import' ? null : 'import')}
                className="px-4 py-4 cursor-pointer"
                style={{ color: TEXT_MUTED }}>
                <span style={{ display: 'block', transform: expanded === 'import' ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                  <ChevronRight size={5} />
                </span>
              </button>
            </div>

            <div style={{
              maxHeight: expanded === 'import' ? '600px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.35s cubic-bezier(0.22,1,0.36,1)',
            }}>
              <div className="pb-2" style={{ background: 'rgba(0,0,0,0.02)' }}>
                {(t.importCats as unknown as string[]).map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => goTo('/imports', IMPORT_SLUGS[i] ?? toSlug(cat))}
                    className="w-full flex items-center justify-between px-6 py-3 cursor-pointer transition-colors duration-150"
                    style={{ color: TEXT_MUTED }}
                    onTouchStart={e => applyGold(e.currentTarget)}
                    onTouchEnd={e => removeGold(e.currentTarget)}
                  >
                    <span className="text-sm font-medium">{cat}</span>
                    <ChevronRight size={3} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* EXPORTS accordion */}
          <div style={{ borderBottom: '1px solid rgba(212,175,55,0.18)' }}>
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => { onClose(); setExpanded(null); navigate('/exports') }}
                className="flex-1 text-left px-5 py-4 cursor-pointer transition-colors duration-150"
                style={{ color: NAV_GOLD }}
              >
                <span className="text-base font-semibold uppercase tracking-wide">{t.nav.exports}</span>
              </button>
              <button
                onClick={() => setExpanded(expanded === 'export' ? null : 'export')}
                className="px-4 py-4 cursor-pointer"
                style={{ color: TEXT_MUTED }}>
                <span style={{ display: 'block', transform: expanded === 'export' ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                  <ChevronRight size={5} />
                </span>
              </button>
            </div>

            <div style={{
              maxHeight: expanded === 'export' ? '600px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.35s cubic-bezier(0.22,1,0.36,1)',
            }}>
              <div className="pb-2" style={{ background: 'rgba(0,0,0,0.02)' }}>
                {(t.exportCats as unknown as string[]).map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => goTo('/exports', EXPORT_SLUGS[i] ?? toSlug(cat))}
                    className="w-full flex items-center justify-between px-6 py-3 cursor-pointer transition-colors duration-150"
                    style={{ color: TEXT_MUTED }}
                    onTouchStart={e => applyGold(e.currentTarget)}
                    onTouchEnd={e => removeGold(e.currentTarget)}
                  >
                    <span className="text-sm font-medium">{cat}</span>
                    <ChevronRight size={3} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Language toggle */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.18)' }}>
            <p className="text-[0.6rem] font-black uppercase tracking-[0.25em] mb-3" style={{ color: TEXT_MUTED }}>
              {lang === 'es' ? 'Idioma' : 'Language'}
            </p>
            <div className="flex gap-2">
              {(['en', 'es'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer"
                  style={{
                    color: lang === l ? '#0C0C0C' : TEXT_MUTED,
                    background: lang === l ? G_BAR : 'transparent',
                    border: `1px solid ${lang === l ? '#C08010' : '#E8E8E8'}`,
                  }}>
                  <span style={{ fontSize: '0.9rem' }}>{l === 'en' ? '🇺🇸' : '🇲🇽'}</span>
                  {l === 'en' ? 'EN' : 'ES'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer footer CTA */}
        <div className="flex-shrink-0 px-5 py-6" style={{ borderTop: '1px solid rgba(212,175,55,0.18)' }}>
          <p className="text-xs font-light leading-relaxed mb-4" style={{ color: TEXT_MUTED }}>
            {lang === 'es'
              ? 'Te ayudamos a armar la mejor oferta para hacer crecer tu negocio.'
              : 'We help you build the best offer to grow your business.'}
          </p>
          <button
            onClick={goContact}
            className="w-full py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer transition-all duration-200 active:scale-95"
            style={{ background: G_BAR, color: '#0C0C0C' }}>
            {lang === 'es' ? 'Contáctanos →' : 'Contact Us →'}
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   MAIN NAVBAR
═══════════════════════════════════════════════ */
export default function NavBar() {
  const [open, setOpen] = useState<'import' | 'export' | 'about' | 'lang' | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const navRef = useRef<HTMLElement>(null)
  const mobileLangRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      const insideNav = navRef.current?.contains(target) ?? false
      const insideMobileLang = mobileLangRef.current?.contains(target) ?? false
      if (!insideNav && !insideMobileLang) setOpen(null)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler) }
  }, [])

  const handleScrollTo = (id: string) => {
    setOpen(null)
    if (window.location.pathname !== '/') {
      navigate('/')
      // Wait for hero to mount, then expand it, then scroll
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('flaash-expand-hero'))
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80)
      }, 150)
    } else {
      // Expand hero first so onScroll doesn't block navigation
      window.dispatchEvent(new CustomEvent('flaash-expand-hero'))
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80)
    }
  }

  const handleHome = () => {
    setOpen(null)
    if (window.location.pathname !== '/') navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.dispatchEvent(new CustomEvent('flaash-reset-hero'))
  }

  return (
    <>
      {/* ── Gold bar at very top of viewport ── */}
      {/* no top gold bar in this version */}

      <nav ref={navRef}
        className="fixed left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-8 md:px-12"
        style={{ top: 0, height: 64, background: 'rgba(250,250,248,0.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}
        onMouseLeave={() => setOpen(null)}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0"
          onClick={() => { setOpen(null); window.scrollTo({ top: 0, behavior: 'smooth' }); window.dispatchEvent(new CustomEvent('flaash-reset-hero')) }}>
          <span className="gold-chrome-text font-black uppercase tracking-wider text-xl sm:text-2xl">Flaash</span>
        </Link>

        {/* ── DESKTOP nav ── */}
        <ul className="hidden sm:flex items-center gap-1 list-none">
          <li onMouseEnter={() => setOpen(null)}>
            <button onClick={handleHome}
              className="nav-link px-3 py-2 rounded-lg text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-150 cursor-pointer"
              onMouseEnter={e => applyGold(e.currentTarget)}
              onMouseLeave={e => removeGold(e.currentTarget)}>
              {t.nav.home}
            </button>
          </li>


          <li onMouseEnter={() => setOpen(null)}>
            <Link to="/productos"
              className="nav-link px-3 py-2 rounded-lg text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-150"
              style={{ color: NAV_GOLD, background: 'transparent' }}
              onMouseEnter={e => applyGold(e.currentTarget)}
              onMouseLeave={e => removeGold(e.currentTarget)}>
              {t.nav.products}
            </Link>
          </li>

          <li className="relative" onMouseEnter={() => setOpen('import')}>
            <Link to="/imports"
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-150"
              style={{ color: open === 'import' ? NAV_GOLD_SHINE : NAV_GOLD, background: 'transparent' }}
              onClick={() => setOpen(null)}
              onMouseEnter={e => applyGold(e.currentTarget)}
              onMouseLeave={e => removeGold(e.currentTarget)}>
              {t.nav.imports}<ChevronDown />
            </Link>
            {open === 'import' && <Dropdown items={t.importCats as unknown as string[]} slugs={IMPORT_SLUGS} basePath="/imports" cols={2} onClose={() => setOpen(null)} />}
          </li>

          <li className="relative" onMouseEnter={() => setOpen('export')}>
            <Link to="/exports"
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-150"
              style={{ color: open === 'export' ? NAV_GOLD_SHINE : NAV_GOLD, background: 'transparent' }}
              onClick={() => setOpen(null)}
              onMouseEnter={e => applyGold(e.currentTarget)}
              onMouseLeave={e => removeGold(e.currentTarget)}>
              {t.nav.exports}<ChevronDown />
            </Link>
            {open === 'export' && <Dropdown items={t.exportCats as unknown as string[]} slugs={EXPORT_SLUGS} basePath="/exports" cols={1} onClose={() => setOpen(null)} />}
          </li>

          {/* Globe + lang code */}
          <li className="relative" onMouseEnter={() => setOpen('lang')}>
            <button onClick={() => setOpen(open === 'lang' ? null : 'lang')}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer"
              style={{ color: open === 'lang' ? NAV_GOLD_SHINE : NAV_GOLD, background: 'transparent' }}
              aria-label="Select language"
              onMouseEnter={e => applyGold(e.currentTarget)}
              onMouseLeave={e => removeGold(e.currentTarget)}>
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{lang === 'en' ? '🇺🇸' : '🇲🇽'}</span>
              <span className="text-[11px] font-black tracking-wider">{lang.toUpperCase()}</span>
            </button>
            {open === 'lang' && <LangDropdown onClose={() => setOpen(null)} />}
          </li>

          <li onMouseEnter={() => setOpen(null)}>
            <button onClick={() => handleScrollTo('contacto')}
              className="nav-link px-3 py-2 rounded-lg text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-150 cursor-pointer"
              onMouseEnter={e => applyGold(e.currentTarget)}
              onMouseLeave={e => removeGold(e.currentTarget)}>
              {t.nav.contact}
            </button>
          </li>

          <li onMouseEnter={() => setOpen(null)}>
            <CartButton variant="desktop" />
          </li>
        </ul>

        {/* ── MOBILE right side ── */}
        <div className="flex sm:hidden items-center gap-0.5">

          <button onClick={handleHome}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: NAV_GOLD }}
            onTouchStart={e => applyGold(e.currentTarget)}
            onTouchEnd={e => removeGold(e.currentTarget)}>
            <HouseIcon />
          </button>

          <button onClick={() => setOpen(open === 'lang' ? null : 'lang')}
            className="flex items-center gap-0.5 px-1.5 py-2 rounded-lg transition-all duration-150 cursor-pointer"
            style={{ color: open === 'lang' ? NAV_GOLD_SHINE : NAV_GOLD, background: open === 'lang' ? 'rgba(0,0,0,0.03)' : 'transparent' }}
            aria-label="Select language">
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>{lang === 'en' ? '🇺🇸' : '🇲🇽'}</span>
            <span className="text-[10px] font-black tracking-wider">{lang.toUpperCase()}</span>
          </button>

          <button onClick={() => handleScrollTo('contacto')}
            className="px-1.5 py-2 rounded-lg text-[10px] font-medium uppercase tracking-normal transition-colors duration-150 cursor-pointer"
            style={{ color: NAV_GOLD }}
            onTouchStart={e => applyGold(e.currentTarget)}
            onTouchEnd={e => removeGold(e.currentTarget)}>
            {t.nav.contact}
          </button>

          <CartButton variant="mobile" />

          {/* ☰ Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center w-8 h-8 gap-[5px] rounded-lg cursor-pointer ml-0.5"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(212,175,55,0.15)' }}
            aria-label="Open menu">
            <span className="block h-px w-4" style={{ background: G_BAR }} />
            <span className="block h-px w-4" style={{ background: G_BAR }} />
            <span className="block h-px w-4" style={{ background: G_BAR }} />
          </button>
        </div>
      </nav>

      {/* ── Mobile language dropdown ── */}
      {open === 'lang' && (
        <div ref={mobileLangRef} className="fixed sm:hidden z-[60]" style={{ top: 68, right: 56 }}>
          <MobileLangPanel onClose={() => setOpen(null)} />
        </div>
      )}

      {/* ── Nike-style drawer ── */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

/* Small helper — mobile lang panel rendered outside nav */
function MobileLangPanel({ onClose }: { onClose: () => void }) {
  const { lang, setLang } = useLanguage()
  return (
    <div className="rounded-2xl shadow-2xl py-2"
      style={{ background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(16px)', width: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      {(['en', 'es'] as const).map(l => (
        <button key={l} onClick={() => { setLang(l); onClose() }}
          className="w-full text-left text-xs px-4 py-3 flex items-center gap-2.5 transition-colors duration-150 cursor-pointer"
          style={{ color: lang === l ? TEXT_PRIMARY : TEXT_MUTED, background: lang === l ? 'rgba(0,0,0,0.04)' : 'transparent' }}>
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>{l === 'en' ? '🇺🇸' : '🇲🇽'}</span>
          <span className="font-semibold uppercase tracking-wider">{l === 'en' ? 'English' : 'Español'}</span>
          {lang === l && (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 ml-auto flex-shrink-0" style={{ color: '#C8A028' }}>
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}
