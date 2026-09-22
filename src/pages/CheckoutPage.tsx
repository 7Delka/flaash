import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js'
import NavBar from '../components/NavBar'
import ContactFooter from '../components/ContactFooter'
import PhoneInput from '../components/PhoneInput'
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'
import { formatMXN, isFreeShippingZone, SHIPPING_COST_MXN } from '../lib/money'
import { BANK_TRANSFER_INFO } from '../lib/bankTransferConfig'
import type { PaymentMethod } from '../lib/orderTypes'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK as string)

// ── Small UI helpers ─────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.3)',
  borderRadius: 10, padding: '10px 14px', color: '#0C0C0C', fontSize: '0.9rem', outline: 'none',
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
const OxxoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M7 15l3-4 3 4 3-4" />
  </svg>
)
const MpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" fill="#009EE3" />
    <path d="M6.5 14.5c.8-1.2 2-2 3.5-2s2.7.8 3.5 2c.8-1.2 2-2 3.5-2" stroke="#FFE600" strokeWidth="1.8" strokeLinecap="round" fill="none" />
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

// ── Inner checkout form (needs Stripe hooks, must be inside <Elements>) ───────
function CheckoutForm() {
  const cart = useCart()
  const { lang } = useLanguage()
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()

  const [step, setStep] = useState<Step>('contact')
  const [deliveryAcked, setDeliveryAcked] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('mercadopago')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    street: '', city: '', state: '', zip: '',
  })

  const t = {
    heading: lang === 'es' ? 'Finalizar Compra' : 'Checkout',
    productsWord: lang === 'es' ? 'productos' : 'products',
    contactTitle: lang === 'es' ? 'Contacto' : 'Contact',
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
    card: lang === 'es' ? 'Tarjeta de crédito / débito' : 'Credit / Debit card',
    oxxo: 'OXXO (efectivo)',
    transfer: lang === 'es' ? 'Transferencia SPEI' : 'SPEI Transfer',
    edit: lang === 'es' ? 'Editar' : 'Edit',
    summary: lang === 'es' ? 'Tu Pedido' : 'Your Order',
    subtotal: lang === 'es' ? 'Subtotal' : 'Subtotal',
    iva: lang === 'es' ? 'IVA (16%)' : 'VAT (16%)',
    shipping: lang === 'es' ? 'Envío' : 'Shipping',
    freeCDMX: lang === 'es' ? 'Gratis (CDMX)' : 'Free (CDMX)',
    quoteShipping: lang === 'es' ? 'A cotizar' : 'To be quoted',
    fillAddress: lang === 'es' ? 'Completá tu dirección' : 'Fill in your address',
    total: 'Total',
    pay: lang === 'es' ? 'Pagar Ahora' : 'Pay Now',
    processing: lang === 'es' ? 'Procesando…' : 'Processing…',
    emptyCart: lang === 'es' ? 'Tu carrito está vacío.' : 'Your cart is empty.',
    backToProducts: lang === 'es' ? 'Ver productos disponibles →' : 'View available products →',
    pending: lang === 'es' ? 'A confirmar' : 'To be confirmed',
    remove: lang === 'es' ? 'Eliminar' : 'Remove',
    cardInfo: lang === 'es'
      ? 'Pago seguro procesado por Stripe. Tu tarjeta se cobra al instante.'
      : 'Secure payment processed by Stripe. Your card is charged immediately.',
    oxxoInfo: lang === 'es'
      ? 'Recibís una referencia de pago para abonar en cualquier tienda OXXO.'
      : 'You receive a payment reference to pay at any OXXO store.',
    transferInfo: lang === 'es'
      ? 'Tu pedido queda pendiente hasta que confirmemos la transferencia.'
      : 'Your order stays pending until we confirm the transfer.',
    pendingBlock: lang === 'es'
      ? 'Tu carrito tiene productos con precio a confirmar. Contactanos por WhatsApp o quitálos del carrito.'
      : 'Your cart has items with a price to be confirmed. Contact us on WhatsApp or remove them.',
    quoteBlock: lang === 'es'
      ? 'Envíos fuera de CDMX se cotizan por WhatsApp antes de pagar.'
      : 'Shipping outside CDMX is quoted on WhatsApp before payment.',
    addressBlock: lang === 'es'
      ? 'Completá ciudad y estado para calcular el envío.'
      : 'Fill in city and state to calculate shipping.',
    bank: lang === 'es' ? 'Banco' : 'Bank',
    holder: lang === 'es' ? 'Titular' : 'Account holder',
    clabe: 'CLABE',
    mercadopago: lang === 'es' ? 'Mercado Pago · Tarjeta de crédito / débito' : 'Mercado Pago · Credit / Debit card',
    mpInfo: lang === 'es'
      ? 'Podés pagar con tu tarjeta de crédito o débito, en efectivo (OXXO) o con tu saldo de Mercado Pago. Serás redirigido de forma segura a la plataforma de pago.'
      : 'You can pay with your credit or debit card, cash (OXXO), or your Mercado Pago balance. You will be securely redirected to the payment platform.',
  }

  const hasPending = cart.items.some(i => i.unitPrice === 0)
  const contactValid = form.email.trim().length > 3 && form.email.includes('@')
  const addressValid = form.fullName.trim().length > 0 && form.phone.trim().length > 5
    && form.street.trim().length > 0 && form.city.trim().length > 0
    && form.state.trim().length > 0 && form.zip.trim().length > 0
  const addressFilled = form.city.trim().length > 0 && form.state.trim().length > 0
  const isFreeShipping = addressFilled && isFreeShippingZone(form.city, form.state)
  const shippingCost = !addressFilled ? 0 : isFreeShipping ? 0 : SHIPPING_COST_MXN
  const orderTotal = cart.total + shippingCost

  const goTo = (target: Step) => setStep(target)
  const goNext = (from: Step) => {
    const idx = STEP_ORDER.indexOf(from)
    if (idx < STEP_ORDER.length - 1) setStep(STEP_ORDER[idx + 1])
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || hasPending || step !== 'payment') return
    setError('')
    setError('')
    setSubmitting(true)

    try {
      // Mercado Pago Checkout Pro — save order then redirect to MP
      if (method === 'mercadopago') {
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.items.map(i => ({ id: i.id, name: i.name, unitPrice: i.unitPrice, qty: i.qty })),
            subtotal: cart.subtotal, iva: cart.iva, shipping: shippingCost, total: orderTotal,
            customer: { fullName: form.fullName, email: form.email, phone: form.phone,
              address: { street: form.street, city: form.city, state: form.state, zip: form.zip } },
            paymentMethod: 'mercadopago',
            paymentStatus: 'pending',
          }),
        })
        if (!orderRes.ok) throw new Error('No se pudo registrar el pedido.')
        const { orderId } = await orderRes.json()

        const mpRes = await fetch('/api/mp-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            items: cart.items.map(i => ({ id: i.id, name: i.name, unitPrice: i.unitPrice, qty: i.qty })),
            shipping: shippingCost,
          }),
        })
        if (!mpRes.ok) throw new Error('No se pudo iniciar el pago con Mercado Pago.')
        const { initPoint } = await mpRes.json()

        cart.clear()
        window.location.href = initPoint
        return
      }

      // SPEI / OXXO — save order as pending, redirect to confirmation
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(i => ({ id: i.id, name: i.name, unitPrice: i.unitPrice, qty: i.qty })),
          subtotal: cart.subtotal, iva: cart.iva, shipping: shippingCost, total: orderTotal,
          customer: { fullName: form.fullName, email: form.email, phone: form.phone,
            address: { street: form.street, city: form.city, state: form.state, zip: form.zip } },
          paymentMethod: method,
          paymentStatus: 'pending',
        }),
      })
      if (!res.ok) throw new Error(`create-order failed: ${res.status}`)
      const { orderId } = await res.json()
      cart.clear()
      navigate(`/order/${orderId}`)
    } catch (err: unknown) {
      console.error(err)
      setError(lang === 'es'
        ? 'No pudimos procesar el pedido. Intentá de nuevo o contactanos por WhatsApp.'
        : 'Could not process your order. Try again or contact us on WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }, [submitting, hasPending, step, method, stripe, elements, cart, form, lang, navigate, shippingCost, orderTotal])

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
    { id: 'mercadopago', label: t.mercadopago, icon: <MpIcon /> },
    { id: 'transfer',    label: t.transfer,    icon: <BankIcon /> },
    { id: 'oxxo',        label: t.oxxo,        icon: <OxxoIcon /> },
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
                  <Field label="Email" type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                  <button type="button" disabled={!contactValid} onClick={() => goNext('contact')}
                    className="w-full flex items-center justify-between px-6 py-4 rounded-xl text-sm font-black uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#0C0C0C', color: '#FFFFFF', cursor: contactValid ? 'pointer' : 'not-allowed' }}>
                    <span>{lang === 'es' ? 'Siguiente' : 'Next'}</span><span>→</span>
                  </button>
                </div>
              )}
            </div>

            {/* DIRECCIÓN */}
            <div className="rounded-2xl p-5 sm:p-6" style={sectionCardStyle}>
              <SectionHeader id="address" title={t.addressTitle} isOpen={step === 'address'} isDone={addressValid}
                summary={addressValid ? `${form.fullName} — ${form.street}, ${form.city}` : undefined} />
              {step === 'address' && (
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field label={t.fullName} required value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div className="sm:col-span-1">
                    <PhoneInput
                      label={t.phone}
                      value={form.phone}
                      onChange={phone => setForm(f => ({ ...f, phone }))}
                      required
                    />
                  </div>
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
                      className="w-full flex items-center justify-between px-6 py-4 rounded-xl text-sm font-black uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: '#0C0C0C', color: '#FFFFFF', cursor: addressValid ? 'pointer' : 'not-allowed' }}>
                      <span>{lang === 'es' ? 'Siguiente' : 'Next'}</span><span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ENTREGA */}
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
                      <label className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                        style={{
                          border: `1.5px solid ${method === m.id ? '#D4AF37' : 'rgba(212,175,55,0.25)'}`,
                          borderBottomLeftRadius: method === m.id ? 0 : undefined,
                          borderBottomRightRadius: method === m.id ? 0 : undefined,
                          background: method === m.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                        }}>
                        <input type="radio" name="method" checked={method === m.id}
                          onChange={() => { setMethod(m.id); setError('') }} className="sr-only" />
                        <span style={{ color: '#0C0C0C' }}>{m.icon}</span>
                        <span className="text-sm font-semibold" style={{ color: '#0C0C0C' }}>{m.label}</span>
                      </label>

                      {method === m.id && (
                        <div className="px-4 py-3 rounded-b-xl text-xs leading-relaxed"
                          style={{ border: '1.5px solid #D4AF37', borderTop: 'none', background: 'rgba(212,175,55,0.04)', color: 'rgba(12,12,12,0.7)' }}>
                          {m.id === 'mercadopago' && t.mpInfo}
                          {m.id === 'oxxo' && t.oxxoInfo}
                          {m.id === 'transfer' && (
                            BANK_TRANSFER_INFO.isConfigured ? (
                              <div className="flex flex-col gap-1">
                                <p><strong>{t.bank}:</strong> {BANK_TRANSFER_INFO.bankName}</p>
                                <p><strong>{t.holder}:</strong> {BANK_TRANSFER_INFO.accountHolder}</p>
                                <p><strong>{t.clabe}:</strong> {BANK_TRANSFER_INFO.clabe}</p>
                                <p className="mt-1" style={{ color: 'rgba(12,12,12,0.5)' }}>{t.transferInfo}</p>
                              </div>
                            ) : t.transferInfo
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RESUMEN */}
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
                      className="flex-shrink-0 p-1 cursor-pointer"
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
                  <span style={{ color: !addressFilled ? 'rgba(245,240,232,0.5)' : isFreeShipping ? '#7CC576' : 'rgba(245,240,232,0.85)' }}>
                    {!addressFilled ? t.fillAddress : isFreeShipping ? t.freeCDMX : formatMXN(SHIPPING_COST_MXN)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black pt-2 mt-1" style={{ color: '#D4AF37', borderTop: '1px dashed rgba(212,175,55,0.3)' }}>
                  <span>{t.total}</span><span>{formatMXN(orderTotal)}</span>
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
                  {lang === 'es'
                    ? `Se agregará un costo de envío de ${formatMXN(SHIPPING_COST_MXN)} para envíos fuera de CDMX y Estado de México.`
                    : `A shipping fee of ${formatMXN(SHIPPING_COST_MXN)} will be added for deliveries outside CDMX and Estado de México.`}
                </p>
              )}
              {error && (
                <p className="text-xs mt-4 p-3 rounded-lg" style={{ color: '#FFD8D8', background: 'rgba(200,50,50,0.15)', border: '1px solid rgba(200,50,50,0.3)' }}>
                  {error}
                </p>
              )}

              <button type="submit"
                disabled={submitting || hasPending || step !== 'payment'}
                className="w-full mt-5 py-3.5 rounded-full text-sm font-black uppercase tracking-widest transition-transform duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)', color: '#0C0C0C' }}>
                {submitting ? t.processing : t.pay}
              </button>

              {method === 'mercadopago' && step === 'payment' && (
                <p className="text-center text-xs mt-3" style={{ color: 'rgba(245,240,232,0.35)' }}>
                  🔒 {lang === 'es' ? 'Pago seguro con Mercado Pago' : 'Secure payment by Mercado Pago'}
                </p>
              )}
            </div>
          </div>
        </form>
      </main>
      <ContactFooter />
    </div>
  )
}

// ── Wrapper con Elements provider ─────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise} options={{ locale: 'es', loader: 'never' }}>
      <CheckoutForm />
    </Elements>
  )
}
