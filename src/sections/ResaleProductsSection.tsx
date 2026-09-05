import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useCart } from '../contexts/CartContext'
import { PRODUCTS, CATEGORIES, type CatalogProduct } from '../data/catalog'

const GOLD = '#D4AF37'
const DARK = '#0C0C0C'
const PER_PAGE = 20

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=480&h=480&fit=crop&auto=format`
const CAT_IMGS: Record<string, string[]> = {
  technology:     [U('1518770660439-4636190af475'), U('1505740420928-5e560c06d30e'), U('1526374965328-7f61d4dc18c5'), U('1574944985070-8f3ebc6b79d2'), U('1496181133206-80ce9b88a853'), U('1488590528505-98d2b5aba04b')],
  home:           [U('1556909114-f6e7ad7d3136'), U('1556910103-1c02745aae4d'), U('1583847268964-b28dc8f51f92'), U('1565538852-ff01fba8da7e'), U('1556909172-54557c7e4fb7'), U('1584346133934-a8d2b3e4caae')],
  sports:         [U('1517836357463-d25dfeac3438'), U('1526506118085-60ce8714f8c5'), U('1571019613454-1cb2f99b2d8b'), U('1552674605-db5fecabfe68'), U('1534438327431-02f37e04f3e5'), U('1599058945522-f8b9c4b31bb3')],
  beauty:         [U('1596462502278-27bfdc403348'), U('1522335789203-aabd1fc54bc9'), U('1487412947254-e85cf0c8cc79'), U('1567721913486-6585f069b332'), U('1571781926291-c49f4f9b4e37'), U('1503236823255-152977d74afb')],
  'fashion-women':[U('1445205170230-053b83016050'), U('1490481651871-ab68de25d43d'), U('1558171813-d2aca99bd4d2'), U('1529139374472-79992afde8d2'), U('1583744946564-b6447f3e6df4'), U('1509631179647-0177331693ae')],
  'fashion-men':  [U('1507003211169-0a1dd7228f2d'), U('1617137968427-85924e0a2bfc'), U('1617634999690-c1c9fddd0c99'), U('1593030761757-71fae45fa0e7'), U('1512353087810-25dcd7b9e5bd'), U('1583744946564-b6447f3e6df4')],
  toys:           [U('1558060370-d644479cb6f7'), U('1566576912321-d58ddd7a6088'), U('1587654780291-39c9404d746b'), U('1506744038136-46273834b3fb'), U('1515488042361-ee00e0ddd4e4'), U('1611532736597-de2d4265fba3')],
  tools:          [U('1530124566582-a618bc2615dc'), U('1504917595217-d4dc5ebe6122'), U('1572981779307-38ab55d9b980'), U('1558618666-fcd25c85cd64'), U('1590402494587-44544cd61f58'), U('1519389950473-47ba0277781c')],
  pets:           [U('1601758228041-f3b2795255f1'), U('1587300003388-59208cc962cb'), U('1548767797-d8c844163c4a'), U('1574158622682-e8a6fe4d7ad9'), U('1568640347145-b5e5ded979ef'), U('1560743641-3914f2c45db4')],
  security:       [U('1585771724684-38269d6639fd'), U('1558618047-3d7a5b2a2b50'), U('1563013544-824ae1b704d3'), U('1553484771-371a816b2772'), U('1526374870839-e155464bb9b2'), U('1557804506-669a67965ba0')],
  lighting:       [U('1558618666-fcd25c85cd64'), U('1507473885765-e6ed057f782c'), U('1621275471153-6b12b59c5a89'), U('1513506003901-1e6a35d44614'), U('1488229297597-9bc6b4a7f1da'), U('1550029402-226b6f71ba4c')],
  automotive:     [U('1492144534655-ae79c964c9d7'), U('1503376780353-7e6692767b70'), U('1558618047-3d7a5b2a2b50'), U('1511919884226-fd3cad3abfc6'), U('1547245947-cb2df4dd89fe'), U('1502877338535-766e1452684a')],
  decoration:     [U('1555041469-db26f89df576'), U('1493663284031-b7e3aefcae8e'), U('1506439773649-6e0eb8cfb237'), U('1513694203232-719a6ca57ef4'), U('1449247709967-d4461a6a6103'), U('1586023492125-27b2c045efd3')],
}
function productImgs(product: CatalogProduct): string[] {
  if (product.aliexpressUrl) return product.images
  const pool = CAT_IMGS[product.category] ?? CAT_IMGS.technology
  const base = product.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return [0, 1, 2].map(i => pool[(base + i) % pool.length])
}

/* ── Stars ─────────────────────────────────────────────────────────────── */
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-4 h-4' : 'w-3 h-3'
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} viewBox="0 0 24 24" className={`${sz} flex-shrink-0`}
          fill={n <= Math.round(rating) ? GOLD : 'none'} stroke={GOLD} strokeWidth={1.5}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span className={`${size === 'md' ? 'text-xs' : 'text-[10px]'} ml-1 font-semibold`} style={{ color: '#666' }}>{rating}</span>
    </span>
  )
}

/* ── Product Detail Modal ───────────────────────────────────────────────── */
function ProductModal({ product, lang, onAdd, onClose }: {
  product: CatalogProduct
  lang: string
  onAdd: (p: CatalogProduct) => void
  onClose: () => void
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const imgs = productImgs(product)
  const name = lang === 'en' ? product.nameEn : product.nameEs
  const desc = lang === 'en' ? product.descEn : product.descEs
  const discount = product.originalPriceMXN
    ? Math.round((1 - product.priceMXN / product.originalPriceMXN) * 100)
    : 0
  const details: string[] = (product as any).details || []

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setImgIdx(i => (i - 1 + imgs.length) % imgs.length)
      if (e.key === 'ArrowRight') setImgIdx(i => (i + 1) % imgs.length)
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose, imgs.length])

  const handleAdd = () => {
    onAdd(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>

      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative"
        onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button type="button" onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>
          ✕
        </button>

        <div className="flex flex-col md:flex-row">

          {/* ── Left: Images ── */}
          <div className="md:w-[48%] p-4 flex flex-col gap-3" style={{ background: '#F8F7F4' }}>

            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-white"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
              <img
                src={imgs[imgIdx]}
                alt={name}
                className="w-full h-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}${imgIdx}/600/600` }}
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-black"
                  style={{ background: '#ef4444', color: '#fff' }}>
                  -{discount}%
                </span>
              )}
              {imgs.length > 1 && (
                <>
                  <button type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg font-black cursor-pointer"
                    style={{ background: 'rgba(0,0,0,0.45)', color: '#fff' }}
                    onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}>
                    ‹
                  </button>
                  <button type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg font-black cursor-pointer"
                    style={{ background: 'rgba(0,0,0,0.45)', color: '#fff' }}
                    onClick={() => setImgIdx(i => (i + 1) % imgs.length)}>
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {imgs.map((img, i) => (
                  <button key={i} type="button"
                    onClick={() => setImgIdx(i)}
                    className="w-[60px] h-[60px] rounded-xl overflow-hidden cursor-pointer flex-shrink-0 transition-all"
                    style={{
                      border: `2.5px solid ${i === imgIdx ? GOLD : 'transparent'}`,
                      opacity: i === imgIdx ? 1 : 0.65,
                      boxShadow: i === imgIdx ? `0 0 0 1px ${GOLD}` : 'none',
                    }}>
                    <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}${i}/120/120` }} />
                  </button>
                ))}
              </div>
            )}

            {/* Image counter */}
            <p className="text-[10px] text-center" style={{ color: '#bbb' }}>
              {imgIdx + 1} / {imgs.length} {lang === 'en' ? 'photos' : 'fotos'}
            </p>
          </div>

          {/* ── Right: Info ── */}
          <div className="md:w-[52%] p-5 sm:p-7 flex flex-col gap-4">

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {product.badge && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
                  style={{ background: GOLD, color: DARK }}>
                  {product.badge}
                </span>
              )}
              {product.isNew && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                  style={{ background: '#22c55e', color: '#fff' }}>
                  {lang === 'en' ? 'New' : 'Nuevo'}
                </span>
              )}
            </div>

            {/* Name */}
            <h2 className="text-xl sm:text-2xl font-black leading-snug" style={{ color: DARK }}>
              {name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <Stars rating={product.rating} size="md" />
              <span className="text-xs" style={{ color: '#999' }}>
                {product.reviews.toLocaleString()} {lang === 'en' ? 'reviews' : 'reseñas'}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: '#555' }}>
              {desc}
            </p>

            {/* Technical specs */}
            {details.length > 0 && (
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: GOLD }}>
                  {lang === 'en' ? 'Specifications' : 'Especificaciones'}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#444' }}>
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                        style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
                        ✓
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Divider */}
            <hr style={{ borderColor: 'rgba(212,175,55,0.2)' }} />

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black" style={{ color: DARK }}>
                ${product.priceMXN.toLocaleString()}
              </span>
              {product.originalPriceMXN && (
                <span className="text-base line-through" style={{ color: '#bbb' }}>
                  ${product.originalPriceMXN.toLocaleString()}
                </span>
              )}
              <span className="text-sm" style={{ color: '#aaa' }}>MXN</span>
              {discount > 0 && (
                <span className="text-sm font-black" style={{ color: '#ef4444' }}>
                  -{discount}%
                </span>
              )}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95"
              style={{
                background: added ? '#22c55e' : DARK,
                color: added ? '#fff' : GOLD,
                border: `2px solid ${added ? '#22c55e' : DARK}`,
              }}>
              {added
                ? (lang === 'en' ? '✓ Added!' : '✓ ¡Agregado!')
                : (lang === 'en' ? '+ Add to Cart' : '+ Agregar al Carrito')}
            </button>

            <p className="text-[10px] text-center" style={{ color: '#bbb' }}>
              {lang === 'en'
                ? 'Price in Mexican pesos. Import included.'
                : 'Precio en pesos mexicanos. Importación incluida.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Product Card ───────────────────────────────────────────────────────── */
function ProductCard({ product, lang, onAdd, onOpen }: {
  product: CatalogProduct
  lang: string
  onAdd: (p: CatalogProduct) => void
  onOpen: (p: CatalogProduct) => void
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const [hovered, setHovered] = useState(false)
  const imgs = productImgs(product)
  const name = lang === 'en' ? product.nameEn : product.nameEs
  const desc = lang === 'en' ? product.descEn : product.descEs
  const discount = product.originalPriceMXN
    ? Math.round((1 - product.priceMXN / product.originalPriceMXN) * 100)
    : 0

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{
        border: '1px solid rgba(212,175,55,0.15)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.12)' : '0 2px 10px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image ── */}
      <div className="relative w-full aspect-square overflow-hidden cursor-pointer" style={{ background: '#F5F5F5' }}
        onClick={() => onOpen(product)}>
        <img
          src={imgs[imgIdx]}
          alt={name}
          className="w-full h-full object-cover"
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.4s ease' }}
          loading="lazy"
          onError={e => {
            const el = e.currentTarget
            el.onerror = null
            el.src = `https://picsum.photos/seed/${product.id}${imgIdx}/480/480`
          }}
        />

        {/* Badges */}
        {product.badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide z-10"
            style={{ background: GOLD, color: DARK }}>
            {product.badge}
          </span>
        )}
        {!product.badge && product.isNew && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase z-10"
            style={{ background: '#22c55e', color: '#fff' }}>
            {lang === 'en' ? 'New' : 'Nuevo'}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black z-10"
            style={{ background: '#ef4444', color: '#fff' }}>
            -{discount}%
          </span>
        )}

        {/* Carousel controls */}
        {imgs.length > 1 && (
          <>
            <button type="button"
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-base font-bold z-10"
              style={{ background: 'rgba(0,0,0,0.45)', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}
              onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + imgs.length) % imgs.length) }}>
              ‹
            </button>
            <button type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-base font-bold z-10"
              style={{ background: 'rgba(0,0,0,0.45)', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}
              onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % imgs.length) }}>
              ›
            </button>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {imgs.map((_, i) => (
                <button key={i} type="button"
                  onClick={e => { e.stopPropagation(); setImgIdx(i) }}
                  className="rounded-full transition-all duration-200"
                  style={{ width: i === imgIdx ? 14 : 6, height: 6, background: i === imgIdx ? GOLD : 'rgba(255,255,255,0.7)' }} />
              ))}
            </div>
          </>
        )}

        {/* Photo count badge */}
        {imgs.length > 1 && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold z-10"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
            📷 {imgs.length}
          </span>
        )}
      </div>

      {/* ── Info ── */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-bold leading-snug cursor-pointer hover:underline"
          style={{ color: DARK, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          onClick={() => onOpen(product)}>
          {name}
        </p>
        <p className="text-[10px] leading-snug" style={{ color: '#888', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {desc}
        </p>

        <div className="flex items-center gap-1.5 mt-0.5">
          <Stars rating={product.rating} />
        </div>
        <p className="text-[9px]" style={{ color: '#ccc' }}>
          {product.reviews.toLocaleString()} {lang === 'en' ? 'reviews' : 'reseñas'}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          <span className="text-sm font-black" style={{ color: DARK }}>
            ${product.priceMXN.toLocaleString()}
          </span>
          {product.originalPriceMXN && (
            <span className="text-[10px] line-through" style={{ color: '#bbb' }}>
              ${product.originalPriceMXN.toLocaleString()}
            </span>
          )}
          <span className="text-[9px]" style={{ color: '#aaa' }}>MXN</span>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-1.5 mt-1">
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="flex-1 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95"
            style={{ background: DARK, color: GOLD, border: `1.5px solid ${DARK}` }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = GOLD; (e.currentTarget as HTMLButtonElement).style.color = DARK }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = DARK; (e.currentTarget as HTMLButtonElement).style.color = GOLD }}>
            {lang === 'en' ? '+ Cart' : '+ Agregar'}
          </button>

          <button
            type="button"
            onClick={() => onOpen(product)}
            className="px-2.5 py-1.5 rounded-full text-[10px] font-semibold cursor-pointer transition-all"
            style={{ border: `1.5px solid rgba(212,175,55,0.5)`, color: '#777', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = GOLD; (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = '#777'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
            {lang === 'en' ? 'Details' : 'Ver más'}
          </button>
        </div>
      </div>
    </article>
  )
}

/* ── Main Section ───────────────────────────────────────────────────────── */
export default function ResaleProductsSection() {
  const { lang } = useLanguage()
  const { addItem } = useCart()

  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'new'>('popular')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [page, setPage] = useState(1)
  const [modalProduct, setModalProduct] = useState<CatalogProduct | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const resetPage = useCallback(() => setPage(1), [])

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeCategory])

  const filtered = useMemo(() => {
    let list = [...PRODUCTS]

    if (activeCategory !== 'all')
      list = list.filter(p => p.category === activeCategory)

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p => {
        const n = (lang === 'en' ? p.nameEn : p.nameEs).toLowerCase()
        const d = (lang === 'en' ? p.descEn : p.descEs).toLowerCase()
        return n.includes(q) || d.includes(q)
      })
    }

    const min = parseFloat(priceMin) || 0
    const max = parseFloat(priceMax) || Infinity
    list = list.filter(p => p.priceMXN >= min && p.priceMXN <= max)

    if (sortBy === 'popular')    list.sort((a, b) => b.reviews - a.reviews)
    if (sortBy === 'price-asc')  list.sort((a, b) => a.priceMXN - b.priceMXN)
    if (sortBy === 'price-desc') list.sort((a, b) => b.priceMXN - a.priceMXN)
    if (sortBy === 'rating')     list.sort((a, b) => b.rating - a.rating)
    if (sortBy === 'new')        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))

    return list
  }, [activeCategory, query, sortBy, priceMin, priceMax, lang])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PRODUCTS.length }
    CATEGORIES.slice(1).forEach(c => { counts[c.id] = PRODUCTS.filter(p => p.category === c.id).length })
    return counts
  }, [])

  const handleAdd = useCallback((p: CatalogProduct) => {
    addItem({ id: p.id, name: lang === 'en' ? p.nameEn : p.nameEs, unitPrice: p.priceMXN, image: p.images[0] })
  }, [addItem, lang])

  const SORT_OPT = lang === 'en'
    ? [
        { v: 'popular',    l: 'Most Popular' },
        { v: 'price-asc',  l: 'Price: Low → High' },
        { v: 'price-desc', l: 'Price: High → Low' },
        { v: 'rating',     l: 'Top Rated' },
        { v: 'new',        l: 'New Arrivals' },
      ]
    : [
        { v: 'popular',    l: 'Más populares' },
        { v: 'price-asc',  l: 'Precio: menor a mayor' },
        { v: 'price-desc', l: 'Precio: mayor a menor' },
        { v: 'rating',     l: 'Mejor valorados' },
        { v: 'new',        l: 'Novedades primero' },
      ]

  const pageNums: number[] = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3)              return [1, 2, 3, 4, 5]
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [page - 2, page - 1, page, page + 1, page + 2]
  })()

  return (
    <>
      {/* Modal */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          lang={lang}
          onAdd={handleAdd}
          onClose={() => setModalProduct(null)}
        />
      )}

      <section ref={sectionRef} className="py-12" style={{ background: '#F8F7F4' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(212,175,55,0.9)' }}>
              {lang === 'en' ? 'Resale Catalog' : 'Catálogo de Reventa'}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <h2 className="text-3xl sm:text-4xl font-black" style={{ color: DARK }}>
                {lang === 'en' ? 'Products' : 'Productos'}
              </h2>
              <p className="text-sm" style={{ color: '#999' }}>
                {filtered.length} {lang === 'en' ? 'products' : 'productos'}
              </p>
            </div>
          </div>

          <div className="flex gap-6">

            {/* ── Sidebar ── */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <div className="sticky top-24 rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(212,175,55,0.18)', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: GOLD }}>
                    {lang === 'en' ? 'Categories' : 'Categorías'}
                  </p>
                </div>

                <nav className="py-1.5">
                  {CATEGORIES.map(cat => {
                    const active = activeCategory === cat.id
                    return (
                      <button key={cat.id} type="button"
                        onClick={() => { setActiveCategory(cat.id); resetPage() }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left cursor-pointer transition-all duration-150"
                        style={{
                          background: active ? 'rgba(212,175,55,0.07)' : 'transparent',
                          borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
                          color: active ? DARK : '#555',
                        }}>
                        <span className="flex items-center gap-2 text-xs font-medium">
                          <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{cat.emoji}</span>
                          {lang === 'en' ? cat.nameEn : cat.nameEs}
                        </span>
                        <span className="text-[9px] rounded-full px-1.5 py-0.5 font-bold tabular-nums"
                          style={{ background: active ? GOLD : 'rgba(0,0,0,0.06)', color: active ? DARK : '#888' }}>
                          {catCounts[cat.id] ?? 0}
                        </span>
                      </button>
                    )
                  })}
                </nav>

                {/* Price filter */}
                <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                    {lang === 'en' ? 'Price MXN' : 'Precio MXN'}
                  </p>
                  <div className="flex gap-2">
                    {(['Min', 'Max'] as const).map(label => (
                      <input key={label}
                        type="number"
                        placeholder={label}
                        value={label === 'Min' ? priceMin : priceMax}
                        onChange={e => { label === 'Min' ? setPriceMin(e.target.value) : setPriceMax(e.target.value); resetPage() }}
                        className="w-full px-2 py-1.5 rounded-lg text-xs"
                        style={{ border: '1px solid rgba(212,175,55,0.3)', outline: 'none', color: DARK, background: '#fafaf8' }} />
                    ))}
                  </div>
                  {(priceMin || priceMax) && (
                    <button type="button" onClick={() => { setPriceMin(''); setPriceMax(''); resetPage() }}
                      className="mt-2 text-[10px] underline cursor-pointer" style={{ color: '#999' }}>
                      {lang === 'en' ? 'Clear filter' : 'Limpiar filtro'}
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0">

              {/* Mobile categories — AliExpress style */}
              <div className="lg:hidden mb-5">
                <div
                  className="flex gap-1 overflow-x-auto"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 4 }}
                >
                  {CATEGORIES.map(cat => {
                    const active = activeCategory === cat.id
                    const shortName = (lang === 'en' ? cat.nameEn : cat.nameEs)
                      .replace('Hogar y Cocina', 'Hogar').replace('Home & Kitchen', 'Home')
                      .replace('fashion-women', 'Mujer').replace('Ropa de Mujer', 'Mujer')
                      .replace('Women Fashion', 'Women').replace('Ropa de Hombre', 'Hombre')
                      .replace('Men Fashion', 'Men').replace('Todos', 'Todos').replace('All', 'All')
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setActiveCategory(cat.id); resetPage() }}
                        className="flex-shrink-0 flex flex-col items-center gap-1 transition-all"
                        style={{ minWidth: 60, padding: '6px 4px 4px' }}
                      >
                        <div
                          className="flex items-center justify-center rounded-2xl text-xl transition-all"
                          style={{
                            width: 48, height: 48,
                            background: active ? GOLD : '#F5F5F5',
                            boxShadow: active ? `0 2px 8px ${GOLD}66` : 'none',
                            transform: active ? 'scale(1.08)' : 'scale(1)',
                          }}
                        >
                          {cat.emoji}
                        </div>
                        <span
                          className="text-center leading-tight"
                          style={{
                            fontSize: 9.5,
                            fontWeight: active ? 700 : 500,
                            color: active ? GOLD : '#555',
                            maxWidth: 56,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical' as const,
                            overflow: 'hidden',
                          }}
                        >
                          {shortName}
                        </span>
                        {active && (
                          <div style={{ width: 20, height: 2, background: GOLD, borderRadius: 2 }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Search + Sort bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="#bbb" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); resetPage() }}
                    placeholder={lang === 'en' ? 'Search products...' : 'Buscar productos...'}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                    style={{ background: '#fff', border: '1px solid rgba(212,175,55,0.3)', color: DARK, outline: 'none' }}
                  />
                  {query && (
                    <button type="button" onClick={() => { setQuery(''); resetPage() }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                      ✕
                    </button>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value as typeof sortBy); resetPage() }}
                  className="px-3 py-2.5 rounded-xl text-sm cursor-pointer"
                  style={{ background: '#fff', border: '1px solid rgba(212,175,55,0.3)', color: DARK, outline: 'none', minWidth: 190 }}>
                  {SORT_OPT.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>

                {/* Mobile price */}
                <div className="flex gap-2 lg:hidden">
                  <input type="number" placeholder="Min $" value={priceMin}
                    onChange={e => { setPriceMin(e.target.value); resetPage() }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: '#fff', border: '1px solid rgba(212,175,55,0.3)', color: DARK, outline: 'none' }} />
                  <input type="number" placeholder="Max $" value={priceMax}
                    onChange={e => { setPriceMax(e.target.value); resetPage() }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: '#fff', border: '1px solid rgba(212,175,55,0.3)', color: DARK, outline: 'none' }} />
                </div>
              </div>

              {/* Product grid / empty state */}
              {paginated.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-semibold mb-1" style={{ color: DARK }}>
                    {lang === 'en' ? 'No products found' : 'No se encontraron productos'}
                  </p>
                  <p className="text-sm" style={{ color: '#aaa' }}>
                    {lang === 'en' ? 'Try adjusting your search or filters.' : 'Intentá ajustar tu búsqueda o los filtros.'}
                  </p>
                  <button type="button" onClick={() => { setQuery(''); setPriceMin(''); setPriceMax(''); setActiveCategory('all'); resetPage() }}
                    className="mt-4 px-5 py-2 rounded-full text-sm font-bold cursor-pointer"
                    style={{ background: GOLD, color: DARK }}>
                    {lang === 'en' ? 'Clear all filters' : 'Limpiar filtros'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {paginated.map(prod => (
                    <ProductCard key={prod.id} product={prod} lang={lang} onAdd={handleAdd} onOpen={setModalProduct} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  <button type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-40 transition-all"
                    style={{ background: '#fff', border: '1px solid rgba(212,175,55,0.3)', color: DARK }}>
                    ← {lang === 'en' ? 'Prev' : 'Ant.'}
                  </button>

                  {pageNums.map(p => (
                    <button key={p} type="button"
                      onClick={() => setPage(p)}
                      className="w-9 h-9 rounded-xl text-sm cursor-pointer transition-all"
                      style={{
                        background: page === p ? GOLD : '#fff',
                        color: page === p ? DARK : '#666',
                        border: '1px solid rgba(212,175,55,0.3)',
                        fontWeight: page === p ? 800 : 500,
                      }}>
                      {p}
                    </button>
                  ))}

                  <button type="button"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-40 transition-all"
                    style={{ background: '#fff', border: '1px solid rgba(212,175,55,0.3)', color: DARK }}>
                    {lang === 'en' ? 'Next' : 'Sig.'} →
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </>
  )
}
