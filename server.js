import express from 'express'
import { createTransport } from 'nodemailer'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomBytes } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const ORDERS_DIR = join(__dirname, 'orders')

app.use(express.json())

// Serve static React build
app.use(express.static(join(__dirname, 'dist')))

// ── Order storage helpers ──────────────────────────────────────────────────

async function ensureOrdersDir() {
  if (!existsSync(ORDERS_DIR)) await mkdir(ORDERS_DIR, { recursive: true })
}

function genOrderId() {
  const rand = randomBytes(3).toString('hex').toUpperCase()
  const ts = Date.now().toString(36).toUpperCase()
  return `FLA-${ts}-${rand}`
}

async function saveOrder(order) {
  await ensureOrdersDir()
  await writeFile(join(ORDERS_DIR, `${order.id}.json`), JSON.stringify(order, null, 2))
}

async function getOrder(id) {
  try {
    const raw = await readFile(join(ORDERS_DIR, `${id}.json`), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ── Email helper ───────────────────────────────────────────────────────────

function fmt(n) {
  return `ARS $ ${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

async function sendOrderEmail(data) {
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (!gmailUser || !gmailPass) return

  const itemsHtml = data.items.map(i =>
    `<tr><td style="padding:4px 8px">${i.name}</td><td style="padding:4px 8px;text-align:center">${i.qty}</td><td style="padding:4px 8px;text-align:right">${fmt(i.unitPrice * i.qty)}</td></tr>`
  ).join('')

  const addr = data.customer.address
  const addressLine = addr ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}` : '—'
  const paymentLabels = { card: 'Tarjeta (Mercado Pago)', mplink: 'Mercado Pago (link)', transfer: 'Transferencia Bancaria (Galicia)', oxxo: 'OXXO' }

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0C0C0C">
  <div style="background:#0C0C0C;padding:24px;text-align:center">
    <h1 style="color:#D4AF37;margin:0;font-size:24px;letter-spacing:4px">FLAASH</h1>
    <p style="color:rgba(245,240,232,0.6);margin:4px 0 0;font-size:12px">Nuevo pedido recibido</p>
  </div>
  <div style="padding:24px;background:#FAFAF8">
    <h2 style="margin:0 0 16px;font-size:16px">Pedido <span style="color:#D4AF37">#${data.orderId}</span></h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead><tr style="background:#F0EDE6">
        <th style="padding:6px 8px;text-align:left;font-size:12px">Producto</th>
        <th style="padding:6px 8px;text-align:center;font-size:12px">Cant.</th>
        <th style="padding:6px 8px;text-align:right;font-size:12px">Total</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
      <tr><td style="padding:2px 0;color:#666">Subtotal</td><td style="text-align:right">${fmt(data.subtotal)}</td></tr>
      <tr><td style="padding:2px 0;color:#666">IVA (21%)</td><td style="text-align:right">${fmt(data.iva)}</td></tr>
      <tr><td style="padding:2px 0;color:#666">Envío</td><td style="text-align:right">${data.shipping === 0 ? 'Gratis' : fmt(data.shipping)}</td></tr>
      <tr style="font-weight:bold;font-size:16px;border-top:2px solid #D4AF37">
        <td style="padding:8px 0">TOTAL</td><td style="text-align:right;color:#D4AF37">${fmt(data.total)}</td>
      </tr>
    </table>
    <div style="background:#F0EDE6;padding:16px;border-radius:8px;margin-bottom:16px">
      <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px">Datos del cliente</h3>
      <p style="margin:2px 0;font-size:14px"><strong>Nombre:</strong> ${data.customer.fullName}</p>
      <p style="margin:2px 0;font-size:14px"><strong>Email:</strong> ${data.customer.email}</p>
      <p style="margin:2px 0;font-size:14px"><strong>Teléfono:</strong> ${data.customer.phone || '—'}</p>
      <p style="margin:2px 0;font-size:14px"><strong>Dirección:</strong> ${addressLine}</p>
    </div>
    <div style="background:#F0EDE6;padding:16px;border-radius:8px">
      <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px">Método de pago</h3>
      <p style="margin:0;font-size:14px">${paymentLabels[data.paymentMethod] ?? data.paymentMethod}</p>
    </div>
  </div>
</div>`

  const transporter = createTransport({ service: 'gmail', auth: { user: gmailUser, pass: gmailPass } })
  await transporter.sendMail({
    from: `"Flaash Tienda" <${gmailUser}>`,
    to: gmailUser,
    subject: `🛒 Nuevo pedido #${data.orderId} — ${fmt(data.total)}`,
    html,
  })
}

// ── API Routes ─────────────────────────────────────────────────────────────

// POST /api/create-order
app.post('/api/create-order', async (req, res) => {
  const body = req.body
  if (!body.items?.length || !body.customer?.email || !body.customer?.fullName) {
    return res.status(400).json({ error: 'Missing required order fields' })
  }
  const now = new Date().toISOString()
  const order = {
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
  await saveOrder(order)

  // Fire-and-forget email
  sendOrderEmail({
    orderId: order.id, customer: order.customer, items: order.items,
    subtotal: order.subtotal, iva: order.iva, shipping: order.shipping,
    total: order.total, paymentMethod: order.paymentMethod,
  }).catch(err => console.error('Email error:', err))

  res.json({ orderId: order.id })
})

// GET /api/get-order
app.get('/api/get-order', async (req, res) => {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing id' })
  const order = await getOrder(id)
  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.json(order)
})

// POST /api/send-order-notification
app.post('/api/send-order-notification', async (req, res) => {
  try {
    await sendOrderEmail(req.body)
    res.json({ ok: true })
  } catch (err) {
    console.error('Email error:', err)
    res.json({ ok: false })
  }
})

// POST /api/create-mp-preference
app.post('/api/create-mp-preference', async (req, res) => {
  const accessToken = process.env.MP_ACCESS_TOKEN
  const siteUrl = process.env.SITE_URL
  if (!accessToken || !siteUrl) {
    return res.status(500).json({ error: 'Missing MP_ACCESS_TOKEN or SITE_URL' })
  }
  const { orderId } = req.body
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' })

  const order = await getOrder(orderId)
  if (!order) return res.status(404).json({ error: 'Order not found' })

  try {
    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        external_reference: order.id,
        items: order.items.map(i => ({ id: i.id, title: i.name, quantity: i.qty, unit_price: i.unitPrice, currency_id: 'ARS' })),
        shipments: order.shipping > 0 ? { cost: order.shipping, mode: 'not_specified' } : undefined,
        payer: { name: order.customer.fullName, email: order.customer.email },
        back_urls: {
          success: `${siteUrl}/order/${order.id}`,
          pending: `${siteUrl}/order/${order.id}`,
          failure: `${siteUrl}/order/${order.id}`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/mp-webhook`,
      },
    })
    order.mpPreferenceId = result.id
    order.updatedAt = new Date().toISOString()
    await saveOrder(order)

    const initPoint = accessToken.startsWith('APP_USR') ? result.init_point : (result.sandbox_init_point ?? result.init_point)
    res.json({ initPoint })
  } catch (err) {
    console.error('MP preference error:', err)
    res.status(502).json({ error: 'Failed to create payment preference' })
  }
})

// POST /api/mp-webhook
app.post('/api/mp-webhook', async (req, res) => {
  res.sendStatus(200) // acknowledge
  const { type, data } = req.body
  if (type !== 'payment' || !data?.id) return

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) return
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const payment = await mpRes.json()
    const orderId = payment.external_reference
    if (!orderId) return

    const order = await getOrder(orderId)
    if (!order) return

    const statusMap = { approved: 'approved', rejected: 'rejected', cancelled: 'cancelled', refunded: 'refunded' }
    order.paymentStatus = statusMap[payment.status] ?? 'pending'
    order.mpPaymentId = String(data.id)
    order.updatedAt = new Date().toISOString()
    await saveOrder(order)
  } catch (err) {
    console.error('Webhook error:', err)
  }
})

// SPA fallback — all other routes serve the React app
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => console.log(`Flaash server running on port ${PORT}`))
