import express from 'express'
import { createTransport } from 'nodemailer'
import Stripe from 'stripe'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomBytes } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env manually (no dotenv dependency needed)
try {
  const envPath = join(__dirname, '.env')
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 0) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim()
      if (key && !process.env[key]) process.env[key] = val
    }
  }
} catch {}
const app = express()
const PORT = process.env.PORT || 3000
const ORDERS_DIR = join(__dirname, 'orders')

app.use(express.json())
app.use(express.static(join(__dirname, 'dist')))

// ── Order storage ──────────────────────────────────────────────────────────
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
function fmtMXN(n) {
  return `MXN $${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

async function sendOrderEmail(data) {
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (!gmailUser || !gmailPass) return

  const itemsHtml = data.items.map(i =>
    `<tr><td style="padding:4px 8px">${i.name}</td><td style="padding:4px 8px;text-align:center">${i.qty}</td><td style="padding:4px 8px;text-align:right">${fmtMXN(i.unitPrice * i.qty)}</td></tr>`
  ).join('')

  const addr = data.customer.address
  const addressLine = addr ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}` : '—'
  const paymentLabels = {
    card: 'Tarjeta (Stripe)',
    transfer: 'Transferencia SPEI (Banregio)',
    oxxo: 'OXXO',
    mercadopago: 'Mercado Pago',
  }

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
      <tr><td style="padding:2px 0;color:#666">Subtotal</td><td style="text-align:right">${fmtMXN(data.subtotal)}</td></tr>
      <tr><td style="padding:2px 0;color:#666">IVA (16%)</td><td style="text-align:right">${fmtMXN(data.iva)}</td></tr>
      <tr><td style="padding:2px 0;color:#666">Envío</td><td style="text-align:right">${data.shipping === 0 ? 'Gratis' : fmtMXN(data.shipping)}</td></tr>
      <tr style="font-weight:bold;font-size:16px;border-top:2px solid #D4AF37">
        <td style="padding:8px 0">TOTAL</td><td style="text-align:right;color:#D4AF37">${fmtMXN(data.total)}</td>
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

  // Email to store — sent individually so each recipient doesn't see the others
  const storeRecipients = [gmailUser, 'jorge@formacientifica.com']
  for (const recipient of storeRecipients) {
    await transporter.sendMail({
      from: `"Flaash Tienda" <${gmailUser}>`,
      to: recipient,
      subject: `🛒 Nuevo pedido #${data.orderId} — ${fmtMXN(data.total)}`,
      html,
    })
  }

  // Email to customer
  if (data.customer.email) {
    const customerHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0C0C0C">
  <div style="background:#0C0C0C;padding:24px;text-align:center">
    <h1 style="color:#D4AF37;margin:0;font-size:24px;letter-spacing:4px">FLAASH</h1>
    <p style="color:rgba(245,240,232,0.6);margin:4px 0 0;font-size:12px">Confirmación de pedido</p>
  </div>
  <div style="padding:24px;background:#FAFAF8">
    <h2 style="margin:0 0 8px;font-size:18px">¡Gracias por tu compra, ${data.customer.fullName.split(' ')[0]}!</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px">Tu pedido <strong>#${data.orderId}</strong> fue recibido y está siendo procesado.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead><tr style="background:#F0EDE6">
        <th style="padding:6px 8px;text-align:left;font-size:12px">Producto</th>
        <th style="padding:6px 8px;text-align:center;font-size:12px">Cant.</th>
        <th style="padding:6px 8px;text-align:right;font-size:12px">Total</th>
      </tr></thead>
      <tbody>${data.items.map(i => `<tr><td style="padding:4px 8px">${i.name}</td><td style="padding:4px 8px;text-align:center">${i.qty}</td><td style="padding:4px 8px;text-align:right">${fmtMXN(i.unitPrice * i.qty)}</td></tr>`).join('')}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
      <tr><td style="padding:2px 0;color:#666">Subtotal</td><td style="text-align:right">${fmtMXN(data.subtotal)}</td></tr>
      <tr><td style="padding:2px 0;color:#666">IVA (16%)</td><td style="text-align:right">${fmtMXN(data.iva)}</td></tr>
      <tr><td style="padding:2px 0;color:#666">Envío</td><td style="text-align:right">${data.shipping === 0 ? 'Gratis' : fmtMXN(data.shipping)}</td></tr>
      <tr style="font-weight:bold;font-size:16px;border-top:2px solid #D4AF37">
        <td style="padding:8px 0">TOTAL</td><td style="text-align:right;color:#D4AF37">${fmtMXN(data.total)}</td>
      </tr>
    </table>
    <div style="margin-top:24px;padding:16px;background:#F0EDE6;border-radius:8px;text-align:center">
      <p style="font-size:13px;color:#444;margin:0 0 12px">¿Tenés alguna pregunta sobre tu pedido? Escribinos por WhatsApp y te respondemos enseguida.</p>
      <a href="https://wa.me/5215531856985?text=Hola%2C%20tengo%20una%20consulta%20sobre%20mi%20pedido%20%23${data.orderId}"
        style="display:inline-block;background:#25D366;color:#FFFFFF;font-weight:700;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;">
        💬 Escribir por WhatsApp
      </a>
    </div>
  </div>
  <div style="background:#0C0C0C;padding:16px;text-align:center">
    <p style="color:rgba(245,240,232,0.4);font-size:11px;margin:0">Flaash México — flaash.info@gmail.com</p>
  </div>
</div>`
    await transporter.sendMail({
      from: `"Flaash" <${gmailUser}>`,
      to: data.customer.email,
      subject: `✅ Pedido confirmado #${data.orderId} — Flaash`,
      html: customerHtml,
    })
  }
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
    shipping: body.shipping ?? 0,
    total: body.total,
    currency: 'MXN',
    customer: body.customer,
    paymentMethod: body.paymentMethod,
    paymentStatus: body.paymentStatus ?? 'pending',
    stripePaymentIntentId: body.stripePaymentIntentId ?? null,
    createdAt: now,
    updatedAt: now,
  }
  await saveOrder(order)

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

// POST /api/create-payment-intent  — tarjeta vía Stripe
app.post('/api/create-payment-intent', async (req, res) => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return res.status(500).json({ error: 'Stripe not configured' })

  const { amount, email, name } = req.body
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' })

  try {
    const stripe = new Stripe(secretKey)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // centavos
      currency: 'mxn',
      receipt_email: email || undefined,
      description: `Flaash México — pedido de ${name || 'cliente'}`,
    })
    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Stripe error:', err)
    res.status(502).json({ error: 'Could not create payment intent' })
  }
})

// POST /api/stripe-webhook
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  let event = req.body

  if (webhookSecret) {
    const sig = req.headers['stripe-signature']
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`)
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    // Find order by stripePaymentIntentId and update status
    const files = await import('fs/promises').then(m => m.readdir(ORDERS_DIR).catch(() => []))
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      const order = await getOrder(file.replace('.json', ''))
      if (order?.stripePaymentIntentId === pi.id) {
        order.paymentStatus = 'approved'
        order.updatedAt = new Date().toISOString()
        await saveOrder(order)
        break
      }
    }
  }

  res.sendStatus(200)
})

// POST /api/mp-preference — Mercado Pago Checkout Pro
app.post('/api/mp-preference', async (req, res) => {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) return res.status(500).json({ error: 'Mercado Pago not configured' })

  const { orderId, items, shipping } = req.body
  if (!orderId || !items?.length) return res.status(400).json({ error: 'Missing fields' })

  try {
    const client = new MercadoPagoConfig({ accessToken })
    const pref = new Preference(client)
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000'

    const mpItems = items.map(i => ({
      id: String(i.id),
      title: i.name,
      quantity: i.qty,
      unit_price: i.unitPrice,
      currency_id: 'MXN',
    }))
    if (shipping > 0) {
      mpItems.push({ id: 'shipping', title: 'Envío', quantity: 1, unit_price: shipping, currency_id: 'MXN' })
    }

    const result = await pref.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${siteUrl}/order/${orderId}?mp=approved`,
          failure: `${siteUrl}/checkout?mp=failed`,
          pending: `${siteUrl}/order/${orderId}?mp=pending`,
        },
        auto_return: 'approved',
        external_reference: orderId,
      },
    })

    res.json({ initPoint: result.init_point })
  } catch (err) {
    console.error('MP error:', err)
    res.status(502).json({ error: 'Could not create MP preference' })
  }
})

// SPA fallback
app.get('/{*path}', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => console.log(`Flaash server running on port ${PORT}`))
