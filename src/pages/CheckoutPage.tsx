import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import ContactFooter from '../components/ContactFooter'
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'
import { formatMXN, isFreeShippingZone } from '../lib/money'
import { BANK_TRANSFER_INFO } from '../lib/bankTransferConfig'
import type { PaymentMethod } from '../lib/orderTypes'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#FFFFFF',
  border: '1px solid rgba(212,175,55,0.3)',
  borderRadius: 10,
  padding: '10px 14px',
  color: '#0C0C0C',
  fontSize: '0.9rem',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em',
  textTransform: 'uppercase', marginBottom: 6, color: 'rgba(12,12,12,0.55)',
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input {...props} style={inputStyle} />
    </div>
  )
}

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
  </svg>
)

const BankIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 21h18M4 21V10m16 11V10M2 10l10-6 10 6M6 10v6m4-6v6m4-6v6m4-6v6" />
  </svg>
)
const MPIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" />
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4 flex-shrink-0 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

type Step = 'contact' | 'address' | 'delivery' | 'payment'
const STEP_ORDER: Step[] = ['contact', 'address', 'delivery', 'payment']

export default function CheckoutPage() {
  const cart = useCart()
  const { lang } = useLanguage()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('contact')
  const [deliveryAcked, setDeliveryAcked] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mpLinkModal, setMpLinkModal] = useState<{ total: number; orderId: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', street: '', city: '', state: '', zip: '' })

  const t = {
    heading: lang === 'es' ? 'Finalizar Compra' : 'Checkout',
    productsWord: lang === 'es' ? 'productos' : 'products',
    contactTitle: lang === 'es' ? 'Contacto' : 'Contact',
    email: 'Email',
    addressTitle: lang === 'es' ? 'Dirección' : 'Address',
    fullName: lang === 'es' ? 'Nombre Completo' : 'Full Name',
    phone: lang === 'es' ? 'Teléfono' : 'Phone',
    street: lang === 'es' ? 'Calle y Número' : 'Street & Number',
    city: lang === 'es' ? 'Ciudad' : 'City',
    state: lang === 'es' ? 'Estado' : 'State',
    zip: lang === 'es' ? 'Código Postal' : 'ZIP Code',
    deliveryTitle: lang === 'es' ? 'Opciones de Entrega' : 'Delivery Options',
    standardDelivery: lang === 'es' ? 'Entrega Estándar' : 'Standard Delivery',
    paymentTitle: lang === 'es' ? 'Pago' : 'Payment',
    card: lang === 'es' ? 'Tarjeta de Crédito/Débito' : 'Credit/Debit Card',
    mplink: 'Mercado Pago',
    transfer: lang === 'es' ? 'Transferencia Bancaria' : 'Bank Transfer',
    next: lang === 'es' ? 'Siguiente →' : 'Next →',
    edit: lang === 'es' ? 'Editar' : 'Edit',
    summary: lang === 'es' ? 'Tu Pedido' : 'Your Order',
    subtotal: lang === 'es' ? 'Subtotal' : 'Subtotal',
    iva: lang === 'es' ? 'IVA (21%)' : 'VAT (21%)',
    shipping: lang === 'es' ? 'Envío' : 'Shipping',
    freeCDMX: lang === 'es' ? 'Gratis (Buenos Aires)' : 'Free (Buenos Aires)',
    quoteShipping: lang === 'es' ? 'A cotizar (fuera de CABA)' : 'To be quoted (outside Buenos Aires)',
    fillAddress: lang === 'es' ? 'Completá tu dirección' : 'Fill in your address',
    total: 'Total',
    pay: lang === 'es' ? 'Pagar Ahora' : 'Pay Now',
    processing: lang === 'es' ? 'Procesando…' : 'Processing…',
    emptyCart: lang === 'es' ? 'Tu carrito está vacío.' : 'Your cart is empty.',
    backToProducts: lang === 'es' ? 'Ver productos disponibles →' : 'View available products →',
    transferNotReady: lang === 'es'
      ? 'La transferencia bancaria todavía no está configurada. Elegí otro método o contactanos por WhatsApp.'
      : 'Bank transfer is not configured yet. Choose another method or contact us on WhatsApp.',
    cardInfo: lang === 'es'
      ? 'Vas a completar el pago con tu tarjeta en la pantalla segura de Mercado Pago.'
      : 'You\'ll complete payment with your card on Mercado Pago\'s secure checkout screen.',
    mplinkInfo: lang === 'es'
      ? 'Al confirmar, te mostramos el monto exacto y un link directo a Mercado Pago para completar el pago.'
      : 'After confirming, we show you the exact amount and a direct link to Mercado Pago to complete payment.',
    transferInfo: lang === 'es'
      ? 'Tu pedido queda pendiente hasta que confirmemos la transferencia.'
      : 'Your order stays pending until we confirm the transfer.',
    bank: lang === 'es' ? 'Banco' : 'Bank',
    holder: lang === 'es' ? 'Titular' : 'Account holder',
    clabe: 'CBU',
    alias: 'Alias',
    pending: lang === 'es' ? 'A confirmar' : 'To be confirmed',
    remove: lang === 'es' ? 'Eliminar' : 'Remove',
    pendingBlock: lang === 'es'
      ? 'Tu carrito tiene productos con precio a confirmar. Contactanos por WhatsApp para cerrar el precio antes de pagar, o quitalos del carrito para pagar el resto ahora.'
      : 'Your cart has products with a price to be confirmed. Contact us on WhatsApp to confirm pricing before paying, or remove them from the cart to pay for the rest now.',
    quoteBlock: lang === 'es'
      ? 'Los envíos fuera de Buenos Aires se cotizan aparte. Contactanos por WhatsApp con tu dirección para confirmar el costo de envío antes de pagar.'
      : 'Shipping outside Buenos Aires is quoted separately. Contact us on WhatsApp with your address to confirm the shipping cost before paying.',
    addressBlock: lang === 'es'
      ? 'Completá ciudad y estado para calcular el envío.'
      : 'Fill in city and state to calculate shipping.',
  }

  const hasPending = cart.items.some(i => i.unitPrice === 0)
  const contactValid = form.email.trim().length > 3 && form.email.includes('@')
  const addressValid = form.fullName.trim().length > 0 && form.phone.trim().length > 5
    && form.street.trim().length > 0 && form.city.trim().length > 0 && form.state.trim().length > 0 && form.zip.trim().length > 0
  const addressFilled = form.city.trim().length > 0 && form.state.trim().length > 0
  const isFreeShipping = addressFilled && isFreeShippingZone(form.city, form.state)
  const shippingBlocked = !addressFilled || !isFreeShipping

  const goTo = (target: Step) => setStep(target)
  const goNext = (from: Step) => {
    const idx = STEP_ORDER.indexOf(from)
    if (idx < STEP_ORDER.length - 1) setStep(STEP_ORDER[idx + 1])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || hasPending || shippingBlocked || step !== 'payment') return
    setError('')

    if (method === 'transfer' && !BANK_TRANSFER_INFO.isConfigured) {
      setError(t.transferNotReady)
      return
    }

    setSubmitting(true)
    const orderTotal = cart.total
    try {
      if (method === 'mplink') {
        const orderId = `FLA-${Date.now().toString(36).toUpperCase()}`
        const notifPayload = {
          orderId,
          customer: { fullName: form.fullName, email: form.email, phone: form.phone, address: { street: form.street, city: form.city, state: form.state, zip: form.zip } },
          items: cart.items.map(i => ({ id: i.id, name: i.name, unitPrice: i.unitPrice, qty: i.qty })),
          subtotal: cart.subtotal, iva: cart.iva, shipping: 0, total: orderTotal,
          paymentMethod: 'mplink',
        }
        fetch('/api/send-order-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notifPayload),
        }).catch(() => {})
        cart.clear()
        setMpLinkModal({ total: orderTotal, orderId })
        setSubmitting(false)
        return
      }

      const payload = {
        items: cart.items.map(i => ({ id: i.id, name: i.name, unitPrice: i.unitPrice, qty: i.qty })),
        subtotal: cart.subtotal, iva: cart.iva, shipping: 0, total: cart.total,
        customer: {
          fullName: form.fullName, email: form.email, phone: form.phone,
          address: { street: form.street, city: form.city, state: form.state, zip: form.zip },
        },
        paymentMethod: method,
      }

      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`create-order failed: ${res.status}`)
      const { orderId } = await res.json()

      if (method === 'transfer') {
        cart.clear()
        navigate(`/order/${orderId}`)
        return
      }

      // card → Mercado Pago Checkout Pro
      const prefRes = await fetch('/api/create-mp-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (!prefRes.ok) throw new Error(`create-mp-preference failed: ${prefRes.status}`)
      const { initPoint } = await prefRes.json()
      if (!initPoint) throw new Error('No init_point returned')

      cart.clear()
      window.location.href = initPoint
    } catch (err) {
      console.error(err)
      setError(lang === 'es'
        ? 'No pudimos conectar con el servidor de pagos. Esto es esperado si las funciones de Netlify todavía no están desplegadas/configuradas — probá desde el sitio publicado, o contactanos por WhatsApp mientras tanto.'
        : 'We could not reach the payment server. This is expected if Netlify Functions are not deployed/configured yet — try from the published site, or reach us on WhatsApp meanwhile.')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
        <NavBar />
        <main className="pt-32 px-4 pb-20 text-center">
          <p className="text-lg font-semibold mb-4" style={{ color: '#0C0C0C' }}>{t.emptyCart}</p>
          <Link to="/products" className="text-sm font-bold underline" style={{ color: '#D4AF37' }}>{t.backToProducts}</Link>
        </main>
        <ContactFooter />
      </div>
    )
  }

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: 'mplink', label: t.mplink, icon: <MPIcon /> },
    { id: 'transfer', label: t.transfer, icon: <BankIcon /> },
  ]

  const sectionCardStyle: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.2)' }

  function SectionHeader({ id, title, isOpen, isDone, summary }: { id: Step; title: string; isOpen: boolean; isDone: boolean; summary?: string }) {
    return (
      <button type="button" onClick={() => { if (isDone && !isOpen) goTo(id) }}
        disabled={!isDone && !isOpen}
        className="w-full flex items-center justify-between gap-3 text-left"
        style={{ cursor: (isDone && !isOpen) ? 'pointer' : 'default' }}>
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]"
          style={{ color: isOpen ? 'rgba(212,175,55,0.9)' : isDone ? '#0C0C0C' : 'rgba(12,12,12,0.3)' }}>
          {isDone && !isOpen && <span style={{ color: '#7CC576' }}><CheckIcon /></span>}
          {title}
        </span>
        <span className="flex items-center gap-2">
          {isDone && !isOpen && summary && (
            <span className="hidden sm:inline text-xs font-medium" style={{ color: 'rgba(12,12,12,0.45)' }}>{summary}</span>
          )}
          {isDone && !isOpen && <span className="text-[0.65rem] font-bold underline" style={{ color: '#D4AF37' }}>{t.edit}</span>}
          {(isOpen || !isDone) && <ChevronIcon open={isOpen} />}
        </span>
      </button>
    )
  }

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <NavBar />
      <main className="pt-24 px-4 sm:px-6 md:px-10 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="hero-heading font-black uppercase leading-none tracking-tight mb-2"
            style={{ fontSize: 'clamp(2rem, 7vw, 56px)' }}>
            {t.heading}
          </h1>
          <p className="text-sm font-semibold" style={{ color: 'rgba(12,12,12,0.5)' }}>
            ({cart.count} {t.productsWord}) {formatMXN(cart.total)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 flex flex-col gap-4">

            {/* CONTACTO */}
            <div className="rounded-2xl p-5 sm:p-6" style={sectionCardStyle}>
              <SectionHeader id="contact" title={t.contactTitle} isOpen={step === 'contact'} isDone={contactValid} summary={form.email} />
              {step === 'contact' && (
                <div className="mt-5 flex flex-col gap-4">
                  <Field label={t.email} type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                  <button type="button" disabled={!contactValid} onClick={() => goNext('contact')}
                    className="w-full flex items-center justify-between px-6 py-4 rounded-xl text-sm font-black uppercase tracking-wide transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#0C0C0C', color: '#FFFFFF', cursor: contactValid ? 'pointer' : 'not-allowed' }}>
                    <span>{lang === 'es' ? 'Siguiente' : 'Next'}</span><span>→</span>
                  </button>
                </div>
              )}
            </div>

            {/* DIRECCIÓN */}
            <div className="rounded-2xl p-5 sm:p-6" style={sectionCardStyle}>
              <SectionHeader id="address" title={t.addressTitle} isOpen={step === 'address'} isDone={addressValid}
                summary={addressValid ? `${form.fullName} — ${form.street}, ${form.city}, ${form.state}` : undefined} />
              {step === 'address' && (
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field label={t.fullName} required value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <Field label={t.phone} type="tel" required value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                  <div />
                  <div className="sm:col-span-2">
                    <Field label={t.street} required value={form.street}
                      onChange={e => setForm({ ...form, street: e.target.value })} />
                  </div>
                  <Field label={t.city} required value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })} />
                  <Field label={t.state} required value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })} />
                  <Field label={t.zip} required value={form.zip}
                    onChange={e => setForm({ ...form, zip: e.target.value })} />
                  <div className="sm:col-span-2">
                    <button type="button" disabled={!addressValid} onClick={() => goNext('address')}
                      className="w-full flex items-center justify-between px-6 py-4 rounded-xl text-sm font-black uppercase tracking-wide transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: '#0C0C0C', color: '#FFFFFF', cursor: addressValid ? 'pointer' : 'not-allowed' }}>
                      <span>{lang === 'es' ? 'Siguiente' : 'Next'}</span><span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* OPCIONES DE ENTREGA */}
            <div className="rounded-2xl p-5 sm:p-6" style={sectionCardStyle}>
              <SectionHeader id="delivery" title={t.deliveryTitle} isOpen={step === 'delivery'} isDone={deliveryAcked}
                summary={isFreeShipping ? t.freeCDMX : addressFilled ? t.quoteShipping : undefined} />
              {step === 'delivery' && (
                <div className="mt-5 flex flex-col gap-4">
                  <div className="rounded-xl px-5 py-4" style={{ border: '1.5px solid #D4AF37', background: 'rgba(212,175,55,0.06)' }}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black" style={{ color: '#0C0C0C' }}>{t.standardDelivery}</span>
                      <span className="text-sm font-black flex-shrink-0" style={{ color: isFreeShipping ? '#3F9142' : '#B8860B' }}>
                        {isFreeShipping ? t.freeCDMX : t.quoteShipping}
                      </span>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'rgba(12,12,12,0.55)' }}>
                      {form.street}, {form.city}, {form.state}
                    </p>
                    {!isFreeShipping && (
                      <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(12,12,12,0.6)' }}>{t.quoteBlock}</p>
                    )}
                  </div>
                  <button type="button" onClick={() => { setDeliveryAcked(true); goNext('delivery') }}
                    className="w-full flex items-center justify-between px-6 py-4 rounded-xl text-sm font-black uppercase tracking-wide"
                    style={{ background: '#0C0C0C', color: '#FFFFFF', cursor: 'pointer' }}>
                    <span>{lang === 'es' ? 'Siguiente' : 'Next'}</span><span>→</span>
                  </button>
                </div>
              )}
            </div>

            {/* PAGO */}
            <div className="rounded-2xl p-5 sm:p-6" style={sectionCardStyle}>
              <SectionHeader id="payment" title={t.paymentTitle} isOpen={step === 'payment'} isDone={false} />
              {step === 'payment' && (
                <div className="mt-5 flex flex-col gap-2.5">
                  {methods.map(m => (
                    <div key={m.id}>
                      <label className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150"
                        style={{
                          border: `1.5px solid ${method === m.id ? '#D4AF37' : 'rgba(212,175,55,0.25)'}`,
                          borderBottomLeftRadius: method === m.id ? 0 : undefined,
                          borderBottomRightRadius: method === m.id ? 0 : undefined,
                          background: method === m.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                        }}>
                        <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
                        <span style={{ color: '#0C0C0C' }}>{m.icon}</span>
                        <span className="text-sm font-semibold" style={{ color: '#0C0C0C' }}>{m.label}</span>
                      </label>

                      {method === m.id && (
                        <div className="px-4 py-3 rounded-b-xl text-xs leading-relaxed"
                          style={{ border: '1.5px solid #D4AF37', borderTop: 'none', background: 'rgba(212,175,55,0.04)', color: 'rgba(12,12,12,0.7)' }}>
                          {m.id === 'mplink' && t.mplinkInfo}
                          {m.id === 'card' && t.cardInfo}
                          {m.id === 'transfer' && (
                            BANK_TRANSFER_INFO.isConfigured ? (
                              <div className="flex flex-col gap-1">
                                <p><strong>{t.bank}:</strong> {BANK_TRANSFER_INFO.bankName}</p>
                                <p><strong>{t.holder}:</strong> {BANK_TRANSFER_INFO.accountHolder}</p>
                                <p><strong>{t.clabe}:</strong> {BANK_TRANSFER_INFO.clabe}</p>
                                {'alias' in BANK_TRANSFER_INFO && BANK_TRANSFER_INFO.alias && (
                                  <p><strong>{t.alias}:</strong> {BANK_TRANSFER_INFO.alias}</p>
                                )}
                                <p className="mt-1" style={{ color: 'rgba(12,12,12,0.5)' }}>{t.transferInfo}</p>
                              </div>
                            ) : t.transferNotReady
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-2xl p-5 sm:p-6 sticky top-24" style={{ background: '#17171A', border: '1px solid rgba(212,175,55,0.25)' }}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(212,175,55,0.8)' }}>{t.summary}</h2>
              <div className="flex flex-col gap-2.5 mb-4 max-h-64 overflow-y-auto pr-1">
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-2 text-xs" style={{ color: 'rgba(245,240,232,0.85)' }}>
                    <span className="flex-1">{item.name} × {item.qty}</span>
                    <span className="font-bold flex-shrink-0" style={{ color: item.unitPrice === 0 ? '#E0B040' : undefined }}>
                      {item.unitPrice === 0 ? t.pending : formatMXN(item.unitPrice * item.qty)}
                    </span>
                    <button type="button" onClick={() => cart.removeItem(item.id)} aria-label={t.remove}
                      className="flex-shrink-0 p-1 cursor-pointer transition-colors duration-150"
                      style={{ color: 'rgba(245,240,232,0.4)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#E06060'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,240,232,0.4)'}>
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 text-sm pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
                <div className="flex justify-between" style={{ color: 'rgba(245,240,232,0.7)' }}><span>{t.subtotal}</span><span>{formatMXN(cart.subtotal)}</span></div>
                <div className="flex justify-between" style={{ color: 'rgba(245,240,232,0.7)' }}><span>{t.iva}</span><span>{formatMXN(cart.iva)}</span></div>
                <div className="flex justify-between" style={{ color: 'rgba(245,240,232,0.7)' }}>
                  <span>{t.shipping}</span>
                  <span style={{ color: !addressFilled ? 'rgba(245,240,232,0.5)' : isFreeShipping ? '#7CC576' : '#E0B040' }}>
                    {!addressFilled ? t.fillAddress : isFreeShipping ? t.freeCDMX : t.quoteShipping}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black pt-2 mt-1" style={{ color: '#D4AF37', borderTop: '1px dashed rgba(212,175,55,0.3)' }}>
                  <span>{t.total}</span><span>{formatMXN(cart.total)}</span>
                </div>
              </div>

              {hasPending && (
                <p className="text-xs mt-4 p-3 rounded-lg" style={{ color: '#FFE9A8', background: 'rgba(200,152,0,0.15)', border: '1px solid rgba(200,152,0,0.3)' }}>
                  {t.pendingBlock}
                </p>
              )}

              {!hasPending && !addressFilled && (
                <p className="text-xs mt-4 p-3 rounded-lg" style={{ color: 'rgba(245,240,232,0.7)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {t.addressBlock}
                </p>
              )}

              {!hasPending && addressFilled && !isFreeShipping && (
                <p className="text-xs mt-4 p-3 rounded-lg" style={{ color: '#FFE9A8', background: 'rgba(200,152,0,0.15)', border: '1px solid rgba(200,152,0,0.3)' }}>
                  {t.quoteBlock}
                </p>
              )}

              {error && (
                <p className="text-xs mt-4 p-3 rounded-lg" style={{ color: '#FFD8D8', background: 'rgba(200,50,50,0.15)', border: '1px solid rgba(200,50,50,0.3)' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={submitting || hasPending || shippingBlocked || step !== 'payment'}
                className="w-full mt-5 py-3.5 rounded-full text-sm font-black uppercase tracking-widest transition-transform duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)', color: '#0C0C0C', cursor: (submitting || hasPending || shippingBlocked || step !== 'payment') ? 'not-allowed' : 'pointer' }}>
                {submitting ? t.processing : t.pay}
              </button>
            </div>
          </div>
        </form>
      </main>
      <ContactFooter />

      {mpLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4" style={{ background: '#FAFAF8' }}>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: '#D4AF37' }}>
                {lang === 'es' ? 'Pedido registrado' : 'Order registered'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(12,12,12,0.5)' }}>#{mpLinkModal.orderId}</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ background: '#0C0C0C' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(245,240,232,0.5)' }}>
                {lang === 'es' ? 'Monto a pagar en Mercado Pago' : 'Amount to pay in Mercado Pago'}
              </p>
              <p className="text-3xl font-black" style={{ color: '#D4AF37' }}>{formatMXN(mpLinkModal.total)}</p>
            </div>

            <p className="text-xs text-center" style={{ color: 'rgba(12,12,12,0.6)' }}>
              {lang === 'es'
                ? 'Copiá el monto, hacé clic en "Ir a Mercado Pago" e ingresalo cuando te lo pida.'
                : 'Copy the amount, click "Go to Mercado Pago" and enter it when prompted.'}
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(mpLinkModal.total.toFixed(2))
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="w-full py-3 rounded-full text-sm font-bold border-2 transition-colors"
              style={{ borderColor: '#D4AF37', color: '#0C0C0C', background: copied ? '#D4AF37' : 'transparent' }}>
              {copied ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar monto' : 'Copy amount')}
            </button>

            <a
              href="https://link.mercadopago.com.ar/legends"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTimeout(() => setMpLinkModal(null), 500)}
              className="w-full py-3.5 rounded-full text-sm font-black uppercase tracking-widest text-center"
              style={{ background: 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)', color: '#0C0C0C' }}>
              {lang === 'es' ? 'Ir a Mercado Pago →' : 'Go to Mercado Pago →'}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
