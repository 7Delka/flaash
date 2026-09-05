import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import ContactFooter from '../components/ContactFooter'
import { useLanguage } from '../contexts/LanguageContext'
import { formatMXN } from '../lib/money'
import { BANK_TRANSFER_INFO } from '../lib/bankTransferConfig'
import type { Order } from '../lib/orderTypes'

const STATUS_LABEL: Record<string, { es: string; en: string; color: string }> = {
  pending:   { es: 'Pendiente de pago',   en: 'Payment pending',   color: '#C89800' },
  approved:  { es: 'Pago aprobado',       en: 'Payment approved',  color: '#2E7D32' },
  rejected:  { es: 'Pago rechazado',      en: 'Payment rejected',  color: '#C0392B' },
  cancelled: { es: 'Pedido cancelado',    en: 'Order cancelled',   color: '#7A7A7A' },
  refunded:  { es: 'Reembolsado',         en: 'Refunded',          color: '#7A7A7A' },
}

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

  const t = {
    heading: lang === 'es' ? 'Tu Pedido' : 'Your Order',
    orderNum: lang === 'es' ? 'Número de Pedido' : 'Order Number',
    status: lang === 'es' ? 'Estado' : 'Status',
    total: 'Total',
    transferInstructions: lang === 'es' ? 'Datos para tu transferencia' : 'Transfer details',
    bank: lang === 'es' ? 'Banco' : 'Bank',
    holder: lang === 'es' ? 'Titular' : 'Account holder',
    clabe: 'CLABE',
    amount: lang === 'es' ? 'Monto a transferir' : 'Amount to transfer',
    reference: lang === 'es' ? 'Referencia (usá tu número de pedido)' : 'Reference (use your order number)',
    pendingNote: lang === 'es'
      ? 'Tu pedido quedará en estado "pendiente" hasta que confirmemos la recepción de tu transferencia. Te avisaremos por email.'
      : 'Your order will stay "pending" until we confirm your transfer was received. We will email you.',
    notConfigured: lang === 'es'
      ? 'La transferencia bancaria todavía no está disponible. Contactanos por WhatsApp con tu número de pedido para coordinar el pago.'
      : 'Bank transfer is not available yet. Contact us on WhatsApp with your order number to arrange payment.',
    notFound: lang === 'es' ? 'No encontramos este pedido.' : "We couldn't find this order.",
    notFoundHint: lang === 'es'
      ? 'Esto es esperado si las funciones de backend todavía no están desplegadas en producción.'
      : 'This is expected if the backend functions are not deployed to production yet.',
    backHome: lang === 'es' ? 'Volver al inicio' : 'Back to home',
  }

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <NavBar />
      <main className="pt-24 px-4 sm:px-6 md:px-10 pb-16 max-w-xl mx-auto text-center">
        <h1 className="hero-heading font-black uppercase leading-none tracking-tight mb-6"
          style={{ fontSize: 'clamp(2rem, 7vw, 56px)' }}>
          {t.heading}
        </h1>

        {loading && <p style={{ color: 'rgba(12,12,12,0.5)' }}>…</p>}

        {!loading && (fetchError || !order) && (
          <div className="rounded-2xl p-6 text-left" style={{ background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="font-semibold mb-2" style={{ color: '#0C0C0C' }}>
              {t.notFound} <span className="font-mono text-sm" style={{ color: 'rgba(12,12,12,0.5)' }}>#{orderId}</span>
            </p>
            <p className="text-xs mb-4" style={{ color: 'rgba(12,12,12,0.5)' }}>{t.notFoundHint}</p>
            <Link to="/" className="text-sm font-bold underline" style={{ color: '#D4AF37' }}>{t.backHome}</Link>
          </div>
        )}

        {!loading && order && (
          <div className="rounded-2xl p-6 text-left flex flex-col gap-4" style={{ background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.7)' }}>{t.orderNum}</span>
              <span className="font-mono text-sm font-bold" style={{ color: '#0C0C0C' }}>#{order.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.7)' }}>{t.status}</span>
              <span className="text-sm font-bold px-3 py-1 rounded-full"
                style={{ color: '#fff', background: STATUS_LABEL[order.paymentStatus]?.color ?? '#7A7A7A' }}>
                {STATUS_LABEL[order.paymentStatus]?.[lang] ?? order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.7)' }}>{t.total}</span>
              <span className="text-lg font-black" style={{ color: '#0C0C0C' }}>{formatMXN(order.total)}</span>
            </div>

            {order.paymentMethod === 'transfer' && order.paymentStatus === 'pending' && (
              <div className="rounded-xl p-4" style={{ background: '#F3F1EA' }}>
                <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#0C0C0C' }}>{t.transferInstructions}</h3>
                {BANK_TRANSFER_INFO.isConfigured ? (
                  <div className="flex flex-col gap-1.5 text-sm" style={{ color: '#0C0C0C' }}>
                    <p><strong>{t.bank}:</strong> {BANK_TRANSFER_INFO.bankName}</p>
                    <p><strong>{t.holder}:</strong> {BANK_TRANSFER_INFO.accountHolder}</p>
                    <p><strong>{t.clabe}:</strong> {BANK_TRANSFER_INFO.clabe}</p>
                    <p><strong>{t.amount}:</strong> {formatMXN(order.total)}</p>
                    <p><strong>{t.reference}:</strong> #{order.id}</p>
                    <p className="text-xs mt-2" style={{ color: 'rgba(12,12,12,0.55)' }}>{t.pendingNote}</p>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: '#0C0C0C' }}>{t.notConfigured}</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <ContactFooter />
    </div>
  )
}
