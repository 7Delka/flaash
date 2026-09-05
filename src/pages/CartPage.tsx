import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import ContactFooter from '../components/ContactFooter'
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'
import { formatMXN } from '../lib/money'

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="w-3 h-3"><path d="M5 12h14" /></svg>
)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="w-3 h-3"><path d="M12 5v14M5 12h14" /></svg>
)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
  </svg>
)
const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16" style={{ color: 'rgba(212,175,55,0.35)' }}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)
const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
    <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)
const CardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
  </svg>
)
const CashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" />
  </svg>
)
const BankIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 21h18M4 21V10m16 11V10M2 10l10-6 10 6M6 10v6m4-6v6m4-6v6m4-6v6" />
  </svg>
)

export default function CartPage() {
  const { items, increment, decrement, removeItem, count, subtotal, iva, total } = useCart()
  const { lang } = useLanguage()
  const navigate = useNavigate()

  const t = {
    title: lang === 'es' ? 'Tu Carrito' : 'Your Cart',
    products: lang === 'es' ? 'productos' : 'products',
    product: lang === 'es' ? 'producto' : 'product',
    subtext: lang === 'es'
      ? 'Los artículos en tu carrito no están reservados. Terminá el proceso de compra ahora para hacerte con ellos.'
      : 'Items in your cart are not reserved. Complete checkout now to secure them.',
    shippingNote: lang === 'es'
      ? 'Envío gratis dentro de Ciudad de México. Para el resto del país, el costo se cotiza en el checkout.'
      : 'Free shipping within Mexico City. For the rest of the country, cost is quoted at checkout.',
    empty: lang === 'es' ? 'Tu carrito está vacío' : 'Your cart is empty',
    emptyHint: lang === 'es' ? 'Agregá productos desde la sección de stock disponible.' : 'Add products from the available stock section.',
    browseProducts: lang === 'es' ? 'Ver productos →' : 'Browse products →',
    pending: lang === 'es' ? 'Precio a confirmar' : 'Price to be confirmed',
    summary: lang === 'es' ? 'Resumen del Pedido' : 'Order Summary',
    entrega: lang === 'es' ? 'Envío' : 'Shipping',
    calcAtCheckout: lang === 'es' ? 'Se calcula en el checkout' : 'Calculated at checkout',
    total: 'Total',
    subtotalNoIva: lang === 'es' ? 'Subtotal sin IVA' : 'Subtotal before VAT',
    ivaIncluded: lang === 'es' ? 'IVA incluido' : 'VAT included',
    goToPay: lang === 'es' ? 'Ir a pagar →' : 'Checkout →',
    paymentOptions: lang === 'es' ? 'Opciones de Pago' : 'Payment Options',
    card: lang === 'es' ? 'Tarjeta' : 'Card',
    oxxo: 'OXXO',
    transfer: lang === 'es' ? 'Transferencia' : 'Transfer',
  }

  if (items.length === 0) {
    return (
      <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
        <NavBar />
        <main className="pt-32 px-4 pb-24 flex flex-col items-center text-center gap-4">
          <BagIcon />
          <p className="text-xl font-black uppercase" style={{ color: '#0C0C0C' }}>{t.empty}</p>
          <p className="text-sm" style={{ color: 'rgba(12,12,12,0.5)' }}>{t.emptyHint}</p>
          <Link to="/products" className="mt-2 text-sm font-bold underline" style={{ color: '#D4AF37' }}>{t.browseProducts}</Link>
        </main>
        <ContactFooter />
      </div>
    )
  }

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <NavBar />
      <main className="pt-24 px-4 sm:px-6 md:px-10 pb-20 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
          {/* ── LEFT: cart items ── */}
          <div className="lg:col-span-3">
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <h1 className="hero-heading font-black uppercase leading-none tracking-tight" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>
                {t.title}
              </h1>
              <span className="text-sm font-medium" style={{ color: 'rgba(12,12,12,0.5)' }}>
                ({count} {count === 1 ? t.product : t.products})
              </span>
            </div>
            <p className="text-sm mb-6" style={{ color: 'rgba(12,12,12,0.55)' }}>{t.subtext}</p>

            <div className="flex items-center gap-3 p-4 rounded-xl mb-8" style={{ background: '#F3F1EA', color: '#0C0C0C' }}>
              <TruckIcon />
              <p className="text-sm font-medium">{t.shippingNote}</p>
            </div>

            <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(212,175,55,0.18)' }}>
              {items.map(item => (
                <div key={item.id} className="flex gap-4 sm:gap-6 py-6 first:pt-0">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: '#F3F1EA' }}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base sm:text-lg font-bold leading-snug" style={{ color: '#0C0C0C' }}>{item.name}</p>
                      <button onClick={() => removeItem(item.id)} aria-label="Eliminar"
                        className="flex-shrink-0 p-1 cursor-pointer transition-colors duration-150"
                        style={{ color: 'rgba(12,12,12,0.35)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#C0392B'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(12,12,12,0.35)'}>
                        <TrashIcon />
                      </button>
                    </div>

                    <p className="text-xs mt-1 mb-auto" style={{ color: item.unitPrice === 0 ? '#C89800' : 'rgba(12,12,12,0.5)' }}>
                      {item.unitPrice === 0 ? t.pending : `${formatMXN(item.unitPrice)} c/u`}
                    </p>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center gap-3 rounded-full px-1" style={{ border: '1px solid rgba(212,175,55,0.4)' }}>
                        <button onClick={() => decrement(item.id)} aria-label="Menos"
                          className="w-8 h-8 flex items-center justify-center cursor-pointer" style={{ color: '#0C0C0C' }}>
                          <MinusIcon />
                        </button>
                        <span className="text-sm font-bold w-5 text-center" style={{ color: '#0C0C0C' }}>{item.qty}</span>
                        <button onClick={() => increment(item.id)} aria-label="Más"
                          className="w-8 h-8 flex items-center justify-center cursor-pointer" style={{ color: '#0C0C0C' }}>
                          <PlusIcon />
                        </button>
                      </div>
                      <span className="text-lg font-black" style={{ color: item.unitPrice === 0 ? '#C89800' : '#0C0C0C' }}>
                        {item.unitPrice === 0 ? t.pending : formatMXN(item.unitPrice * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: order summary ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-6 sm:p-7 sticky top-24" style={{ background: '#17171A', border: '1px solid rgba(212,175,55,0.25)' }}>
              <h2 className="hero-heading font-black uppercase tracking-wide text-xl mb-5">{t.summary}</h2>

              <div className="flex flex-col gap-2.5 text-sm mb-4">
                <div className="flex justify-between" style={{ color: 'rgba(245,240,232,0.75)' }}>
                  <span>{count} {count === 1 ? t.product : t.products}</span>
                  <span className="font-bold" style={{ color: '#F5F0E8' }}>{formatMXN(subtotal)}</span>
                </div>
                <div className="flex justify-between" style={{ color: 'rgba(245,240,232,0.75)' }}>
                  <span>{t.entrega}</span>
                  <span className="text-xs italic">{t.calcAtCheckout}</span>
                </div>
              </div>

              <div className="pt-4 mb-2" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-black uppercase" style={{ color: '#D4AF37' }}>{t.total}</span>
                  <span className="text-2xl font-black" style={{ color: '#D4AF37' }}>{formatMXN(total)}</span>
                </div>
                <p className="text-[0.7rem] mt-1" style={{ color: 'rgba(245,240,232,0.45)' }}>
                  ({t.subtotalNoIva} {formatMXN(subtotal)}) ({t.ivaIncluded} {formatMXN(iva)})
                </p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 py-4 rounded-full text-sm font-black uppercase tracking-widest cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)', color: '#0C0C0C' }}>
                {t.goToPay}
              </button>

              <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(212,175,55,0.6)' }}>{t.paymentOptions}</p>
                <div className="flex items-center gap-4" style={{ color: 'rgba(245,240,232,0.7)' }}>
                  <span className="flex items-center gap-1.5 text-xs font-medium"><CardIcon />{t.card}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium"><CashIcon />{t.oxxo}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium"><BankIcon />{t.transfer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ContactFooter />
    </div>
  )
}
