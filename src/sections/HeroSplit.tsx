import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const PLANE_IMG = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85'
const SHIP_IMG  = 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=85'

export default function HeroSplit() {
  const { t } = useLanguage()
  const h = t.heroSplit

  return (
    <section id="categorias" className="w-full flex flex-col sm:flex-row relative" style={{ minHeight: '70vh', zIndex: 30 }}>

      {/* LEFT — Imports / Airplane */}
      <Link
        to="/imports"
        className="relative flex-1 flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
        style={{ minHeight: '50vh' }}
      >
        <img
          src={PLANE_IMG}
          alt="Cargo airplane"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
          style={{ background: 'linear-gradient(135deg, rgba(10,8,0,0.62) 0%, rgba(10,8,0,0.45) 100%)' }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(135deg, rgba(10,8,0,0.18) 0%, rgba(10,8,0,0.12) 100%)' }} />

        <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
          <span className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(212,175,55,0.7)' }}>
            {h.importsLabel}
          </span>
          <h2
            className="gold-chrome-text-full font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 80px)' }}
          >
            {h.importsTitle}
          </h2>
          <p className="text-sm sm:text-base font-light max-w-xs" style={{ color: 'rgba(245,240,232,0.65)' }}>
            {h.importsDesc}
          </p>
          <span
            className="mt-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-200 group-hover:scale-105"
            style={{ border: '1px solid rgba(212,175,55,0.5)', color: '#D4AF37', background: 'rgba(212,175,55,0.08)' }}
          >
            {h.importsCta}
          </span>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-px hidden sm:block"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.3), transparent)' }} />
      </Link>

      {/* RIGHT — Exports / Ship */}
      <Link
        to="/exports"
        className="relative flex-1 flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
        style={{ minHeight: '50vh' }}
      >
        <img
          src={SHIP_IMG}
          alt="Cargo ship with containers"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
          style={{ background: 'linear-gradient(225deg, rgba(10,8,0,0.62) 0%, rgba(10,8,0,0.45) 100%)' }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(225deg, rgba(10,8,0,0.18) 0%, rgba(10,8,0,0.12) 100%)' }} />

        <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
          <span className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(212,175,55,0.7)' }}>
            {h.exportsLabel}
          </span>
          <h2
            className="gold-chrome-text-full font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 80px)' }}
          >
            {h.exportsTitle}
          </h2>
          <p className="text-sm sm:text-base font-light max-w-xs" style={{ color: 'rgba(245,240,232,0.65)' }}>
            {h.exportsDesc}
          </p>
          <span
            className="mt-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-200 group-hover:scale-105"
            style={{ border: '1px solid rgba(212,175,55,0.5)', color: '#D4AF37', background: 'rgba(212,175,55,0.08)' }}
          >
            {h.exportsCta}
          </span>
        </div>
      </Link>
    </section>
  )
}
