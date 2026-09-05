import type { Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import type { Order } from '../../src/lib/orderTypes'

// GET /.netlify/functions/get-order?id=FLA-XXXX
// Returns the current state of an order (used by the order status page to
// show whether a payment is pending/approved/rejected, and to display bank
// transfer instructions).

export default async (req: Request, _context: Context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })
  }

  const store = getStore('orders')
  const order = await store.get(id, { type: 'json' }) as Order | null
  if (!order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
  }

  return new Response(JSON.stringify(order), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
