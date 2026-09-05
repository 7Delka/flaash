import { motion } from 'framer-motion'
import NavBar from '../components/NavBar'
import ContactFooter from '../components/ContactFooter'
import { useLanguage } from '../contexts/LanguageContext'

const L = (name: string) => `/bsm/${name}`
const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`

type ImgStyle = React.CSSProperties & { objectFit?: 'cover' | 'contain' }
interface CardBase {
  num: string; slug: string; waMsg: string
  img1: string; img2: string
  img1Style?: ImgStyle; img2Style?: ImgStyle
  noImages?: boolean
}

const EXPORT_BASE: CardBase[] = [
  { num: '01', slug: 'premium-wines',     waMsg: encodeURIComponent("Hello! I'm interested in exporting Premium Wines via Flaash."),         img1: L('wine-1.jpg'),         img2: L('wine-2.jpg') },
  { num: '02', slug: 'craft-gin',         waMsg: encodeURIComponent("Hello! I'm interested in exporting Craft Gin via Flaash."),             img1: L('gin dorado.jpeg'), img2: L('WhatsApp Image 2026-06-02 at 09.39.26.jpeg'), img1Style: { objectPosition: 'center 85%' }, img2Style: { objectPosition: 'center 66%' } },
  { num: '03', slug: 'tequila-reposado',  waMsg: encodeURIComponent("Hello! I'm interested in exporting Tequila Reposado via Flaash."),     img1: L('reserva-magna-crop.jpeg'), img2: U('1634130132261-3bdf61051454'), img1Style: { objectPosition: 'center 50%' } },
  { num: '04', slug: 'alfajores',         waMsg: encodeURIComponent("Hello! I'm interested in exporting Alfajores via Flaash."),            img1: L('alfajor.jpg'),        img2: L('alfajor-2.jpg') },
  { num: '05', slug: 'fertilizers',       waMsg: encodeURIComponent("Hello! I'm interested in exporting Fertilizers via Flaash."),          img1: L('fertilizer-1.jpeg'), img2: L('fertilizer-2.jpeg') },
]

function ProductCard({ base, name, desc, badge, learnMore }: { base: CardBase; name: string; desc: string; badge: string; learnMore: string }) {
  const { lang } = useLanguage()
  const waMsg = lang === 'es'
    ? encodeURIComponent(`¡Hola! Me interesa exportar ${name} a través de Flaash.`)
    : encodeURIComponent(`Hello! I'm interested in exporting ${name} via Flaash.`)
  const baseImg1Style: React.CSSProperties = { width: '40%', height: '100%', ...base.img1Style }
  const baseImg2Style: React.CSSProperties = { height: '100%', ...base.img2Style }
  return (
    <motion.div
      id={base.slug}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.008, boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 4px 20px rgba(212,175,55,0.18)', borderColor: 'rgba(212,175,55,0.55)' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.12 }}
      className="w-full max-w-5xl mx-auto rounded-[32px] sm:rounded-[40px] overflow-hidden mb-8 cursor-default"
      style={{ background: '#17171A', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
    >
      <div className="flex items-start justify-between gap-4 p-5 sm:p-7 flex-wrap">
        <div className="flex items-center gap-5">
          <span className="font-black leading-none flex-shrink-0 select-none"
            style={{ fontSize: 'clamp(3.5rem, 7vw, 90px)', letterSpacing: '-0.04em', background: 'linear-gradient(105deg, #4A2C00 0%, #8B5800 12%, #C8860A 24%, #E0A820 34%, #C89010 44%, #A06808 54%, #C89010 64%, #E0A820 74%, #C8860A 84%, #8B5800 92%, #4A2C00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {base.num}
          </span>
          <div>
            <span className="block text-[0.6rem] font-black uppercase tracking-[0.25em] mb-0.5" style={{ color: 'rgba(154,112,16,0.55)' }}>
              {badge}
            </span>
          <span className="hero-heading block font-black uppercase tracking-wide leading-tight"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.6rem)', wordBreak: 'keep-all' }}>
              {name}
            </span>
            <span className="block text-xs sm:text-sm font-light mt-1"
              style={{ color: 'rgba(245,240,232,0.65)', maxWidth: '42ch', lineHeight: '1.5' }}>
              {desc}
            </span>
          </div>
        </div>
        <a href={`https://wa.me/5491157988854?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:scale-105 self-start mt-1"
          style={{ border: '1.5px solid rgba(212,175,55,0.55)', color: '#D4AF37', background: 'rgba(212,175,55,0.06)' }}>
          {learnMore}
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 flex-shrink-0">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </a>
      </div>

      {/* MOBILE: single full-width image */}
      {!base.noImages && (
        <div className="sm:hidden px-3 pb-3">
          <img
            src={base.img1}
            alt={name}
            loading="lazy"
            className="w-full rounded-2xl object-cover"
            style={{
              height: 'clamp(160px, 52vw, 240px)',
              objectPosition: (base.img1Style as React.CSSProperties & { objectPosition?: string })?.objectPosition ?? 'center',
            }}
          />
        </div>
      )}
      {/* DESKTOP: two images side by side */}
      {!base.noImages && (
        <div className="hidden sm:flex gap-2 px-5 pb-5" style={{ height: 'clamp(210px, 30vw, 370px)' }}>
          <img src={base.img1} alt={name} loading="lazy" className="rounded-2xl object-cover flex-shrink-0" style={baseImg1Style} />
          <img src={base.img2} alt={name} loading="lazy" className="rounded-2xl object-cover flex-grow" style={baseImg2Style} />
        </div>
      )}
    </motion.div>
  )
}

export default function ExportacionesPage() {
  const { t } = useLanguage()
  const p = t.exportsPage
  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <NavBar />
      <main className="pt-24 px-4 sm:px-6 md:px-10 pb-10">
        <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
          <h1 className="hero-heading font-black uppercase leading-none tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 9vw, 88px)' }}>
            {p.heading}
          </h1>
          <p className="font-light leading-relaxed" style={{ color: 'rgba(12,12,12,0.55)', fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)', maxWidth: '56ch', margin: '0 auto' }}>
            {p.description}
          </p>
        </div>
        {EXPORT_BASE.map((base, i) => (
          <ProductCard key={base.num} base={base} name={t.exportItems[i].name} desc={t.exportItems[i].desc} badge={p.badge} learnMore={p.learnMore} />
        ))}
      </main>
      <ContactFooter />
    </div>
  )
}
