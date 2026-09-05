import type { Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import type { Order } from '../../src/lib/orderTypes'

// POST /.netlify/functions/create-mp-preference
// Body: { orderId }
// Creates a Mercado Pago Checkout Pro preference for that order and returns
// { initPoint } — the URL the browser should redirect to for payment.
//
// ⚠️ REQUIRES ENV VARS (set in Netlify site settings → Environment variables):
//   MP_ACCESS_TOKEN   — server-side secret. NEVER expose in frontend code.
//                       Get it from https://www.mercadopago.com.mx/developers/panel
//                       Use the TEST token while in sandbox, the PROD token to go live.
//   SITE_URL          — e.g. https://flaash.mx — used to build back_urls & the webhook URL.

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  const siteUrl = process.env.SITE_URL

  if (!accessToken || !siteUrl) {
    return new Response(JSON.stringify({
      error: 'Payment gateway not configured. Missing MP_ACCESS_TOKEN or SITE_URL env vars.',
    }), { status: 500 })
  }

  let orderId: string
  try {
    const body = await req.json()
    orderId = body.orderId
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Missing orderId' }), { status: 400 })
  }

  const store = getStore('orders')
  const order = await store.get(orderId, { type: 'json' }) as Order | null
  if (!order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
  }

  const client = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(client)

  try {
    const result = await preference.create({
      body: {
        external_reference: order.id,
        items: order.items.map(i => ({
          id: i.id,
          title: i.name,
          quantity: i.qty,
          unit_price: i.unitPrice,
          currency_id: 'ARS',
        })),
        shipments: order.shipping > 0 ? { cost: order.shipping, mode: 'not_specified' } : undefined,
        payer: {
          name: order.customer.fullName,
          email: order.customer.email,
          phone: order.customer.phone ? { number: order.customer.phone } : undefined,
        },
        back_urls: {
          success: `${siteUrl}/order/${order.id}`,
          pending: `${siteUrl}/order/${order.id}`,
          failure: `${siteUrl}/order/${order.id}`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/.netlify/functions/mp-webhook`,
      },
    })

    order.mpPreferenceId = result.id
    order.updatedAt = new Date().toISOString()
    await store.setJSON(order.id, order)

    const initPoint = process.env.MP_ACCESS_TOKEN?.startsWith('APP_USR')
      ? result.init_point
      : (result.sandbox_init_point ?? result.init_point)

    return new Response(JSON.stringify({ initPoint }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Mercado Pago preference error', err)
    return new Response(JSON.stringify({ error: 'Failed to create payment preference' }), { status: 502 })
  }
}
