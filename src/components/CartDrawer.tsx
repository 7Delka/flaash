import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatMXN } from '../lib/money'
import { useLanguage } from '../contexts/LanguageContext'

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
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5"><path d="M18 6 6 18M6 6l12 12" /></svg>
)
const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12" style={{ color: 'rgba(212,175,55,0.4)' }}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

export default function CartDrawer() {
  const { items, isOpen, close, increment, decrement, removeItem, count, subtotal, iva, total } = useCart()
  const { lang } = useLanguage()
  const navigate = useNavigate()

  const t = {
    title: lang === 'es' ? 'Tu Carrito' : 'Your Cart',
    empty: lang === 'es' ? 'Tu carrito está vacío' : 'Your cart is empty',
    emptyHint: lang === 'es' ? 'Agregá productos desde la sección de stock disponible.' : 'Add products from the available stock section.',
    subtotal: lang === 'es' ? 'Subtotal' : 'Subtotal',
    iva: lang === 'es' ? 'IVA (16%)' : 'VAT (16%)',
    shipping: lang === 'es' ? 'Envío' : 'Shipping',
    shippingNote: lang === 'es' ? 'Se calcula en el checkout' : 'Calculated at checkout',
    total: lang === 'es' ? 'Total (sin envío)' : 'Total (before shipping)',
    checkout: lang === 'es' ? 'Ir a pagar →' : 'Checkout →',
    continue: lang === 'es' ? 'Seguir comprando' : 'Continue shopping',
    pending: lang === 'es' ? 'A confirmar' : 'To be confirmed',
    pendingNotice: lang === 'es'
      ? 'Algunos productos todavía no tienen precio confirmado — te contactaremos por WhatsApp para cerrar el precio final antes de cobrar.'
      : 'Some products don\'t have a confirmed price yet — we\'ll reach out on WhatsApp to confirm the final price before charging.',
  }

  const hasPending = items.some(i => i.unitPrice === 0)

  return (
    <>
      <div
        onClick={close}
        className="fixed inset-0 z-[110] transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.55)', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />
      <div
        className="fixed top-0 right-0 h-full z-[120] flex flex-col"
        style={{
          width: '100%', maxWidth: 420,
          background: '#FFFFFF',
          borderLeft: '1px solid rgba(212,175,55,0.25)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(212,175,55,0.18)' }}>
          <span className="hero-heading font-black uppercase tracking-wide text-lg">{t.title}{count > 0 ? ` (${count})` : ''}</span>
          <button onClick={close} aria-label="Cerrar" className="cursor-pointer p-1" style={{ color: '#0C0C0C' }}>
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16">
              <BagIcon />
              <p className="font-semibold" style={{ color: '#0C0C0C' }}>{t.empty}</p>
              <p className="text-xs" style={{ color: 'rgba(12,12,12,0.5)' }}>{t.emptyHint}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: '#F3F1EA' }}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug mb-1 line-clamp-2" style={{ color: '#0C0C0C' }}>{item.name}</p>
                    <p className="text-xs mb-2" style={{ color: item.unitPrice === 0 ? '#C89800' : 'rgba(12,12,12,0.5)' }}>
                      {item.unitPrice === 0 ? t.pending : `${formatMXN(item.unitPrice)} c/u`}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full" style={{ border: '1px solid rgba(212,175,55,0.4)' }}>
                        <button onClick={() => decrement(item.id)} aria-label="Menos"
                          className="w-6 h-6 flex items-center justify-center cursor-pointer" style={{ color: '#0C0C0C' }}>
                          <MinusIcon />
                        </button>
                        <span className="text-xs font-bold w-4 text-center" style={{ color: '#0C0C0C' }}>{item.qty}</span>
                        <button onClick={() => increment(item.id)} aria-label="Más"
                          className="w-6 h-6 flex items-center justify-center cursor-pointer" style={{ color: '#0C0C0C' }}>
                          <PlusIcon />
                        </button>
                      </div>
                      <span className="text-sm font-black" style={{ color: item.unitPrice === 0 ? '#C89800' : '#0C0C0C' }}>
                        {item.unitPrice === 0 ? t.pending : formatMXN(item.unitPrice * item.qty)}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} aria-label="Eliminar"
                    className="flex-shrink-0 self-start p-1 cursor-pointer transition-colors duration-150"
                    style={{ color: 'rgba(12,12,12,0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#C0392B'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(12,12,12,0.35)'}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex-shrink-0 px-5 py-5" style={{ borderTop: '1px solid rgba(212,175,55,0.18)' }}>
            {hasPending && (
              <p className="text-[0.7rem] leading-relaxed mb-4 p-2.5 rounded-lg" style={{ color: '#8A6800', background: 'rgba(200,152,0,0.1)', border: '1px solid rgba(200,152,0,0.25)' }}>
                {t.pendingNotice}
              </p>
            )}
            <div className="flex flex-col gap-1.5 mb-4 text-sm">
              <div className="flex justify-between" style={{ color: 'rgba(12,12,12,0.6)' }}>
                <span>{t.subtotal}</span><span>{formatMXN(subtotal)}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'rgba(12,12,12,0.6)' }}>
                <span>{t.iva}</span><span>{formatMXN(iva)}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'rgba(12,12,12,0.6)' }}>
                <span>{t.shipping}</span><span className="text-xs italic">{t.shippingNote}</span>
              </div>
              <div className="flex justify-between text-base font-black pt-2 mt-1" style={{ color: '#0C0C0C', borderTop: '1px dashed rgba(212,175,55,0.3)' }}>
                <span>{t.total}</span><span>{formatMXN(total)}</span>
              </div>
            </div>
            <button
              onClick={() => { close(); navigate('/checkout') }}
              className="w-full py-3.5 rounded-full text-sm font-black uppercase tracking-widest cursor-pointer transition-transform duration-200 hover:scale-[1.01] mb-2.5"
              style={{ background: 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)', color: '#0C0C0C' }}>
              {t.checkout}
            </button>
            <button onClick={close} className="w-full text-center text-xs font-semibold underline cursor-pointer" style={{ color: 'rgba(12,12,12,0.5)' }}>
              {t.continue}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
