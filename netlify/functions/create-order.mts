import type { Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import type { Order, OrderLineItem, CustomerInfo, PaymentMethod } from '../../src/lib/orderTypes'

// POST /.netlify/functions/create-order
// Body: { items, subtotal, iva, shipping, total, customer, paymentMethod }
// Creates the order in "pending" state and returns { orderId }.
// No secrets needed here — this just persists the order before payment.

function genOrderId(): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  const ts = Date.now().toString(36).toUpperCase()
  return `FLA-${ts}-${rand}`
}

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let body: {
    items: OrderLineItem[]
    subtotal: number
    iva: number
    shipping: number
    total: number
    customer: CustomerInfo
    paymentMethod: PaymentMethod
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  if (!body.items?.length || !body.customer?.email || !body.customer?.fullName) {
    return new Response(JSON.stringify({ error: 'Missing required order fields' }), { status: 400 })
  }

  const now = new Date().toISOString()
  const order: Order = {
    id: genOrderId(),
    items: body.items,
    subtotal: body.subtotal,
    iva: body.iva,
    shipping: body.shipping,
    total: body.total,
    currency: 'ARS',
    customer: body.customer,
    paymentMethod: body.paymentMethod,
    paymentStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  }

  const store = getStore('orders')
  await store.setJSON(order.id, order)

  // Fire-and-forget email notification
  fetch('/.netlify/functions/send-order-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      iva: order.iva,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod,
    }),
  }).catch(err => console.error('Notification email failed', err))

  return new Response(JSON.stringify({ orderId: order.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
