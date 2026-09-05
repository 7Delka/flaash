import type { Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import crypto from 'node:crypto'
import type { Order, PaymentStatus } from '../../src/lib/orderTypes'

// POST /.netlify/functions/mp-webhook
// Mercado Pago calls this URL when a payment's status changes.
// This is the ONLY source of truth for "did the payment actually go through" —
// never trust the browser redirect alone (see back_urls in create-mp-preference).
//
// ⚠️ REQUIRES ENV VARS:
//   MP_ACCESS_TOKEN    — same secret used in create-mp-preference, used here to
//                        fetch the real payment details from Mercado Pago's API.
//   MP_WEBHOOK_SECRET  — the "Clave secreta" shown in MP Developer Panel →
//                        your app → Webhooks. Used to verify the request is
//                        genuinely from Mercado Pago (HMAC signature check).

function mapMpStatus(mpStatus: string): PaymentStatus {
  switch (mpStatus) {
    case 'approved': return 'approved'
    case 'rejected': return 'rejected'
    case 'cancelled': return 'cancelled'
    case 'refunded':
    case 'charged_back': return 'refunded'
    default: return 'pending' // in_process, pending, authorized, etc.
  }
}

function verifySignature(req: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // not configured yet — skip verification (log a warning below)

  const signatureHeader = req.headers.get('x-signature') ?? ''
  const requestId = req.headers.get('x-request-id') ?? ''
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => p.trim().split('=').map(s => s.trim())) as [string, string][],
  )
  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  return expected === v1
}

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const url = new URL(req.url)
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? ''
  const topic = url.searchParams.get('type') ?? url.searchParams.get('topic') ?? ''

  if (!process.env.MP_WEBHOOK_SECRET) {
    console.warn('MP_WEBHOOK_SECRET not set — webhook signature is NOT being verified. Set it before production.')
  }
  if (!verifySignature(req, dataId)) {
    return new Response('Invalid signature', { status: 401 })
  }

  if (topic !== 'payment' || !dataId) {
    // Mercado Pago also sends other topics (merchant_order, etc.) — ack and ignore.
    return new Response('ok', { status: 200 })
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    console.error('MP_ACCESS_TOKEN not set — cannot verify payment with Mercado Pago')
    return new Response('Server not configured', { status: 500 })
  }

  const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!paymentRes.ok) {
    console.error('Failed to fetch payment from Mercado Pago', paymentRes.status)
    return new Response('Failed to verify payment', { status: 502 })
  }
  const payment = await paymentRes.json()
  const orderId: string | undefined = payment.external_reference
  if (!orderId) {
    return new Response('ok', { status: 200 }) // nothing we can reconcile
  }

  const store = getStore('orders')
  const order = await store.get(orderId, { type: 'json' }) as Order | null
  if (!order) {
    console.error(`Webhook for unknown order ${orderId}`)
    return new Response('ok', { status: 200 })
  }

  order.paymentStatus = mapMpStatus(payment.status)
  order.mpPaymentId = String(payment.id)
  order.updatedAt = new Date().toISOString()
  await store.setJSON(order.id, order)

  return new Response('ok', { status: 200 })
}
