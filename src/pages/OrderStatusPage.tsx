import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import ContactFooter from '../components/ContactFooter'
import { useLanguage } from '../contexts/LanguageContext'
import { formatMXN } from '../lib/money'
import { BANK_TRANSFER_INFO } from '../lib/bankTransferConfig'
import type { Order } from '../lib/orderTypes'

export default function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { lang } = useLanguage()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/get-order?id=${orderId}`)
      .then(res => { if (!res.ok) throw new Error(String(res.status)); return res.json() })
      .then(data => { if (!cancelled) setOrder(data) })
      .catch(() => { if (!cancelled) setFetchError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [orderId])

  const isApproved = order?.paymentStatus === 'approved'
  const isPending  = order?.paymentStatus === 'pending'

  if (loading) {
    return (
      <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
        <NavBar />
        <main className="pt-40 text-center">
          <p style={{ color: 'rgba(12,12,12,0.4)', fontSize: '1rem' }}>…</p>
        </main>
      </div>
    )
  }

  if (fetchError || !order) {
    return (
      <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
        <NavBar />
        <main className="pt-32 px-4 pb-20 max-w-md mx-auto text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: '#0C0C0C' }}>
            {lang === 'es' ? 'No encontramos este pedido.' : "We couldn't find this order."}
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(12,12,12,0.5)' }}>#{orderId}</p>
          <Link to="/" className="text-sm font-bold underline" style={{ color: '#D4AF37' }}>
            {lang === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
        </main>
        <ContactFooter />
      </div>
    )
  }

  const addr = order.customer.address

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <NavBar />
      <main className="pt-20 pb-20 px-4 sm:px-6 max-w-lg mx-auto">

        {/* ── Hero banner ─────────────────────────────────────────────────── */}
        <div className="rounded-3xl overflow-hidden mb-6"
          style={{ background: 'linear-gradient(135deg, #0C0C0C 0%, #1a1500 50%, #0C0C0C 100%)', padding: '2.5rem 2rem', textAlign: 'center' }}>

          {isApproved && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                style={{ background: 'rgba(124,197,118,0.15)', border: '2px solid #7CC576' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#7CC576" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h1 className="font-black uppercase tracking-tight leading-none"
                style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', color: '#D4AF37' }}>
                {lang === 'es' ? '¡Pago confirmado!' : 'Payment confirmed!'}
              </h1>
              <p style={{ color: 'rgba(245,240,232,0.7)', fontSize: '0.95rem' }}>
                {lang === 'es'
                  ? 'Gracias por elegir Flaash. Tu pedido está en camino.'
                  : 'Thanks for choosing Flaash. Your order is on its way.'}
              </p>
            </div>
          )}

          {isPending && order.paymentMethod === 'transfer' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                style={{ background: 'rgba(200,152,0,0.15)', border: '2px solid #C89800' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#C89800" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h1 className="font-black uppercase tracking-tight leading-none"
                style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', color: '#D4AF37' }}>
                {lang === 'es' ? '¡Pedido recibido!' : 'Order received!'}
              </h1>
              <p style={{ color: 'rgba(245,240,232,0.7)', fontSize: '0.95rem' }}>
                {lang === 'es'
                  ? 'Solo falta tu transferencia. Abajo encontrás los datos.'
                  : 'Just complete your transfer. Details are below.'}
              </p>
            </div>
          )}

          {isPending && order.paymentMethod === 'oxxo' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                style={{ background: 'rgba(200,152,0,0.15)', border: '2px solid #C89800' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#C89800" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h1 className="font-black uppercase tracking-tight leading-none"
                style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', color: '#D4AF37' }}>
                {lang === 'es' ? '¡Pedido recibido!' : 'Order received!'}
              </h1>
              <p style={{ color: 'rgba(245,240,232,0.7)', fontSize: '0.95rem' }}>
                {lang === 'es'
                  ? 'Contactanos por WhatsApp con tu número de pedido para coordinar el pago.'
                  : 'Contact us on WhatsApp with your order number to arrange payment.'}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs font-mono" style={{ color: 'rgba(212,175,55,0.5)' }}>
            {lang === 'es' ? 'Pedido' : 'Order'} #{order.id}
          </p>
        </div>

        {/* ── Resumen del pedido ───────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)', background: 'rgba(212,175,55,0.04)' }}>
            <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(12,12,12,0.5)' }}>
              {lang === 'es' ? 'Resumen del pedido' : 'Order summary'}
            </span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-2.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span style={{ color: '#0C0C0C' }}>{item.name} <span style={{ color: 'rgba(12,12,12,0.45)' }}>× {item.qty}</span></span>
                <span className="font-bold" style={{ color: '#0C0C0C' }}>{formatMXN(item.unitPrice * item.qty)}</span>
              </div>
            ))}
            <div className="pt-3 mt-1 flex flex-col gap-1" style={{ borderTop: '1px dashed rgba(212,175,55,0.25)' }}>
              <div className="flex justify-between text-xs" style={{ color: 'rgba(12,12,12,0.55)' }}>
                <span>{lang === 'es' ? 'Subtotal' : 'Subtotal'}</span><span>{formatMXN(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'rgba(12,12,12,0.55)' }}>
                <span>IVA (16%)</span><span>{formatMXN(order.iva)}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'rgba(12,12,12,0.55)' }}>
                <span>{lang === 'es' ? 'Envío' : 'Shipping'}</span>
                <span style={{ color: '#3F9142' }}>{order.shipping === 0 ? (lang === 'es' ? 'Gratis' : 'Free') : formatMXN(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-black pt-2" style={{ color: '#D4AF37' }}>
                <span>Total</span><span>{formatMXN(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Datos de entrega ─────────────────────────────────────────────── */}
        {addr && (
          <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)', background: 'rgba(212,175,55,0.04)' }}>
              <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(12,12,12,0.5)' }}>
                {lang === 'es' ? 'Dirección de entrega' : 'Delivery address'}
              </span>
            </div>
            <div className="px-5 py-4 text-sm" style={{ color: '#0C0C0C' }}>
              <p className="font-semibold">{order.customer.fullName}</p>
              <p style={{ color: 'rgba(12,12,12,0.6)' }}>{addr.street}</p>
              <p style={{ color: 'rgba(12,12,12,0.6)' }}>{addr.city}, {addr.state} {addr.zip}</p>
            </div>
          </div>
        )}

        {/* ── Instrucciones de transferencia ──────────────────────────────── */}
        {isPending && order.paymentMethod === 'transfer' && (
          <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#FFFFFF', border: '1.5px solid #C89800' }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(200,152,0,0.2)', background: 'rgba(200,152,0,0.06)' }}>
              <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: '#C89800' }}>
                {lang === 'es' ? 'Datos para tu transferencia' : 'Transfer details'}
              </span>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2 text-sm" style={{ color: '#0C0C0C' }}>
              {BANK_TRANSFER_INFO.isConfigured ? (
                <>
                  <p><strong>{lang === 'es' ? 'Banco' : 'Bank'}:</strong> {BANK_TRANSFER_INFO.bankName}</p>
                  <p><strong>{lang === 'es' ? 'Titular' : 'Account holder'}:</strong> {BANK_TRANSFER_INFO.accountHolder}</p>
                  <p><strong>CLABE:</strong> <span className="font-mono">{BANK_TRANSFER_INFO.clabe}</span></p>
                  <p><strong>{lang === 'es' ? 'Monto exacto' : 'Exact amount'}:</strong> <span className="font-black" style={{ color: '#D4AF37' }}>{formatMXN(order.total)}</span></p>
                  <p><strong>{lang === 'es' ? 'Referencia' : 'Reference'}:</strong> <span className="font-mono">#{order.id}</span></p>
                  <p className="text-xs mt-2 pt-2" style={{ borderTop: '1px dashed rgba(12,12,12,0.1)', color: 'rgba(12,12,12,0.55)' }}>
                    {lang === 'es'
                      ? 'Tu pedido queda reservado 48 hs. Al confirmar la transferencia lo procesamos de inmediato.'
                      : 'Your order is held for 48 hours. Once we confirm the transfer we process it immediately.'}
                  </p>
                </>
              ) : (
                <p style={{ color: 'rgba(12,12,12,0.6)' }}>
                  {lang === 'es'
                    ? 'Contactanos por WhatsApp con tu número de pedido para coordinar el pago.'
                    : 'Contact us on WhatsApp with your order number to arrange payment.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Confirmación por email ──────────────────────────────────────── */}
        <div className="rounded-xl px-5 py-4 mb-6 text-center text-sm" style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(12,12,12,0.65)' }}>
          {lang === 'es'
            ? <>Te enviamos un resumen a <strong style={{ color: '#0C0C0C' }}>{order.customer.email}</strong>.</>
            : <>We sent a summary to <strong style={{ color: '#0C0C0C' }}>{order.customer.email}</strong>.</>}
        </div>

        {/* ── Botones ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="flex-1 py-3.5 rounded-full text-sm font-black uppercase tracking-widest text-center"
            style={{ background: '#0C0C0C', color: '#FFFFFF' }}>
            {lang === 'es' ? 'Seguir comprando' : 'Continue shopping'}
          </Link>
          <a href="https://wa.me/5215531856985" target="_blank" rel="noopener noreferrer"
            className="flex-1 py-3.5 rounded-full text-sm font-black uppercase tracking-widest text-center flex items-center justify-center gap-2"
            style={{ border: '2px solid #0C0C0C', color: '#0C0C0C', background: 'transparent' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.858L0 24l6.335-1.518A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.969 0-3.81-.516-5.404-1.417l-.387-.23-4.01.962.977-3.91-.253-.4A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            WhatsApp
          </a>
        </div>

      </main>
      <ContactFooter />
    </div>
  )
}
