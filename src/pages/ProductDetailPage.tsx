import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import ContactFooter from '../components/ContactFooter'
import { useLanguage } from '../contexts/LanguageContext'
import { useCart } from '../contexts/CartContext'
import { formatMXN } from '../lib/money'
import { PRODUCTS, PLACEHOLDER_IMG, PhotoCarousel, BoxIcon, CheckIcon, TruckIcon, ChevronIcon, type Product } from './ProductsPage'

function RelatedCard({ product, priceLabel, lang }: { product: Product; priceLabel: string; lang: string }) {
  const displayName = lang === 'en' && product.nameEn ? product.nameEn : product.name
  return (
    <Link to={`/products/${product.id}`}
      className="group block rounded-2xl overflow-hidden flex flex-col border transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-[rgba(212,175,55,0.55)] hover:shadow-[0_16px_36px_rgba(212,175,55,0.22)]"
      style={{ background: '#FFFFFF', borderColor: 'rgba(212,175,55,0.18)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {product.photos && product.photos.length > 0 ? (
        <div className="w-full aspect-[4/5] flex-shrink-0 overflow-hidden" style={{ background: '#FFFFFF' }}>
          <div className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.1]">
            <img src={product.photos[0]} alt={displayName} loading="lazy"
              className="w-full h-full object-contain"
              style={{ transform: product.zoom && product.zoom !== 1 ? `scale(${product.zoom})` : undefined }} />
          </div>
        </div>
      ) : (
        <div className="w-full aspect-[4/5] flex items-center justify-center flex-shrink-0" style={{ background: '#FFFFFF' }}>
          <BoxIcon />
        </div>
      )}
      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs font-semibold leading-snug overflow-hidden" style={{ color: '#0C0C0C', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', height: '2.2rem' }}>
          {displayName}
        </p>
        {product.priceMXN ? (
          <span className="text-sm font-black" style={{ color: '#0C0C0C' }}>{formatMXN(product.priceMXN)}</span>
        ) : (
          <span className="text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: 'rgba(12,12,12,0.4)' }}>{priceLabel}</span>
        )}
      </div>
    </Link>
  )
}

function RelatedCarousel({ products, priceLabel, lang }: { products: Product[]; priceLabel: string; lang: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(1)

  const recalc = () => {
    const el = scrollerRef.current
    if (!el) return
    setPages(Math.max(1, Math.round(el.scrollWidth / el.clientWidth)))
  }

  useEffect(() => {
    recalc()
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length])

  const onScroll = () => {
    const el = scrollerRef.current
    if (!el) return
    setPage(Math.round(el.scrollLeft / el.clientWidth))
  }

  const goTo = (idx: number) => {
    const el = scrollerRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(pages - 1, idx))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative group">
      <div ref={scrollerRef} onScroll={onScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-px-0"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {products.map(prod => (
          <div key={prod.id} className="flex-shrink-0 w-[47%] sm:w-[31.5%] lg:w-[23.5%]" style={{ scrollSnapAlign: 'start' }}>
            <RelatedCard product={prod} priceLabel={priceLabel} lang={lang} />
          </div>
        ))}
      </div>

      {pages > 1 && (
        <>
          <button type="button" aria-label="Anterior" onClick={() => goTo(page - 1)} disabled={page === 0}
            className="absolute -left-3 sm:-left-5 top-[38%] -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full transition-opacity duration-200 cursor-pointer"
            style={{ background: '#FFFFFF', color: '#0C0C0C', boxShadow: '0 2px 10px rgba(0,0,0,0.18)', opacity: page === 0 ? 0.35 : 1 }}>
            <ChevronIcon dir="left" />
          </button>
          <button type="button" aria-label="Siguiente" onClick={() => goTo(page + 1)} disabled={page === pages - 1}
            className="absolute -right-3 sm:-right-5 top-[38%] -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full transition-opacity duration-200 cursor-pointer"
            style={{ background: '#FFFFFF', color: '#0C0C0C', boxShadow: '0 2px 10px rgba(0,0,0,0.18)', opacity: page === pages - 1 ? 0.35 : 1 }}>
            <ChevronIcon dir="right" />
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} type="button" aria-label={`Página ${i + 1}`} onClick={() => goTo(i)}
                className="rounded-full transition-all duration-200 cursor-pointer"
                style={{
                  width: i === page ? '20px' : '6px', height: '6px',
                  background: i === page ? '#D4AF37' : 'rgba(12,12,12,0.15)',
                }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { t, lang } = useLanguage()
  const p = t.productsPage
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const product = PRODUCTS.find(prod => prod.id === id)

  if (!product) {
    return (
      <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
        <NavBar />
        <main className="pt-32 px-4 pb-20 text-center">
          <p className="text-lg font-semibold mb-4" style={{ color: '#0C0C0C' }}>{p.notFound}</p>
          <Link to="/products" className="text-sm font-bold underline" style={{ color: '#D4AF37' }}>{p.backToProducts}</Link>
        </main>
        <ContactFooter />
      </div>
    )
  }

  const displayName = lang === 'en' && product.nameEn ? product.nameEn : product.name
  const displayFeatures = lang === 'en' && product.featuresEn ? product.featuresEn : product.features

  const handleAdd = () => {
    addItem({ id: product.id, name: displayName, image: product.photos?.[0] ?? PLACEHOLDER_IMG, unitPrice: product.priceMXN ?? 0 })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1600)
  }

  const related = PRODUCTS.filter(prod => prod.id !== product.id)

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <NavBar />
      <main className="pt-24 px-4 sm:px-6 md:px-10 pb-16 max-w-6xl mx-auto">
        <div className="text-xs font-semibold mb-6" style={{ color: 'rgba(12,12,12,0.45)' }}>
          <Link to="/" className="underline" style={{ color: 'rgba(12,12,12,0.45)' }}>{t.nav.home}</Link>
          {' / '}
          <Link to="/products" className="underline" style={{ color: 'rgba(12,12,12,0.45)' }}>{t.nav.products}</Link>
          {' / '}
          <span>{displayName}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.18)' }}>
            {product.photos && product.photos.length > 0 ? (
              <PhotoCarousel photos={product.photos} alt={displayName} zoom={product.zoom} />
            ) : (
              <div className="w-full aspect-[4/5] flex items-center justify-center" style={{ background: '#FFFFFF' }}>
                <BoxIcon />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[0.65rem] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.8)' }}>
              {p.stockLabel}: {product.qty}
            </span>
            <h1 className="font-black uppercase leading-tight mb-4" style={{ color: '#0C0C0C', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
              {displayName}
            </h1>

            {product.priceMXN ? (
              <span className="text-2xl font-black mb-3" style={{ color: '#0C0C0C' }}>{formatMXN(product.priceMXN)}</span>
            ) : (
              <span className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'rgba(12,12,12,0.4)' }}>{p.pendingPrice}</span>
            )}

            <span className="inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-6"
              style={{ color: '#2E7D32', background: 'rgba(46,125,50,0.12)' }}>
              <TruckIcon />{p.freeShipping}
            </span>

            <button type="button" onClick={handleAdd}
              className="flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200 hover:scale-[1.01] cursor-pointer w-full sm:w-auto sm:px-10"
              style={justAdded
                ? { background: '#2E7D32', color: '#fff', border: '1.5px solid #2E7D32' }
                : { border: '1.5px solid #D4AF37', color: '#0C0C0C', background: 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)' }}>
              {justAdded ? (<><CheckIcon />{p.added}</>) : p.addToCart}
            </button>

            <Link to="/products" className="text-xs font-bold uppercase tracking-wide underline mt-6 w-fit" style={{ color: 'rgba(12,12,12,0.45)' }}>
              {p.backToProducts}
            </Link>

            {displayFeatures && displayFeatures.length > 0 && (
              <div className="mt-8 rounded-2xl p-6 sm:p-8" style={{ background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.18)' }}>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(212,175,55,0.85)' }}>
                  {p.features}
                </h2>
                <ul className="flex flex-col gap-3">
                  {displayFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-snug" style={{ color: 'rgba(12,12,12,0.8)' }}>
                      <span className="flex-shrink-0 mt-1.5 rounded-full" style={{ width: '6px', height: '6px', background: '#D4AF37' }} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 sm:mt-24">
            <h2 className="hero-heading font-black uppercase leading-none tracking-tight mb-8 text-center"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 2.6rem)' }}>
              {p.related}
            </h2>
            <RelatedCarousel products={related} priceLabel={p.pendingPrice} lang={lang} />
          </div>
        )}
      </main>
      <ContactFooter />
    </div>
  )
}
