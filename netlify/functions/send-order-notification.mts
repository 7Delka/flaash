import type { Context } from '@netlify/functions'
import nodemailer from 'nodemailer'

// POST /.netlify/functions/send-order-notification
// Body: { orderId, customer, items, subtotal, iva, shipping, total, paymentMethod }
// Sends order notification email to flaash.info@gmail.com
//
// Required env vars:
//   GMAIL_USER — flaash.info@gmail.com
//   GMAIL_APP_PASSWORD — 16-char app password from myaccount.google.com/apppasswords

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPass) {
    console.warn('Email not configured — missing GMAIL_USER or GMAIL_APP_PASSWORD')
    return new Response(JSON.stringify({ ok: false, error: 'Email not configured' }), { status: 200 })
  }

  let body: {
    orderId: string
    customer: { fullName: string; email: string; phone: string; address?: { street: string; city: string; state: string; zip: string } }
    items: { id: string; name: string; unitPrice: number; qty: number }[]
    subtotal: number
    iva: number
    shipping: number
    total: number
    paymentMethod: string
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const fmt = (n: number) => `ARS $ ${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

  const itemsHtml = body.items.map(i =>
    `<tr><td style="padding:4px 8px">${i.name}</td><td style="padding:4px 8px;text-align:center">${i.qty}</td><td style="padding:4px 8px;text-align:right">${fmt(i.unitPrice * i.qty)}</td></tr>`
  ).join('')

  const addr = body.customer.address
  const addressLine = addr ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}` : '—'

  const paymentLabels: Record<string, string> = {
    card: 'Tarjeta (Mercado Pago)',
    mplink: 'Mercado Pago (link)',
    transfer: 'Transferencia Bancaria (Galicia)',
    oxxo: 'OXXO',
  }

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0C0C0C">
  <div style="background:#0C0C0C;padding:24px;text-align:center">
    <h1 style="color:#D4AF37;margin:0;font-size:24px;letter-spacing:4px">FLAASH</h1>
    <p style="color:rgba(245,240,232,0.6);margin:4px 0 0;font-size:12px">Nuevo pedido recibido</p>
  </div>

  <div style="padding:24px;background:#FAFAF8">
    <h2 style="margin:0 0 16px;font-size:16px">Pedido <span style="color:#D4AF37">#${body.orderId}</span></h2>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead>
        <tr style="background:#F0EDE6">
          <th style="padding:6px 8px;text-align:left;font-size:12px">Producto</th>
          <th style="padding:6px 8px;text-align:center;font-size:12px">Cant.</th>
          <th style="padding:6px 8px;text-align:right;font-size:12px">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
      <tr><td style="padding:2px 0;color:#666">Subtotal</td><td style="text-align:right">${fmt(body.subtotal)}</td></tr>
      <tr><td style="padding:2px 0;color:#666">IVA (21%)</td><td style="text-align:right">${fmt(body.iva)}</td></tr>
      <tr><td style="padding:2px 0;color:#666">Envío</td><td style="text-align:right">${body.shipping === 0 ? 'Gratis' : fmt(body.shipping)}</td></tr>
      <tr style="font-weight:bold;font-size:16px;border-top:2px solid #D4AF37">
        <td style="padding:8px 0">TOTAL</td><td style="text-align:right;color:#D4AF37">${fmt(body.total)}</td>
      </tr>
    </table>

    <div style="background:#F0EDE6;padding:16px;border-radius:8px;margin-bottom:16px">
      <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px">Datos del cliente</h3>
      <p style="margin:2px 0;font-size:14px"><strong>Nombre:</strong> ${body.customer.fullName}</p>
      <p style="margin:2px 0;font-size:14px"><strong>Email:</strong> ${body.customer.email}</p>
      <p style="margin:2px 0;font-size:14px"><strong>Teléfono:</strong> ${body.customer.phone || '—'}</p>
      <p style="margin:2px 0;font-size:14px"><strong>Dirección:</strong> ${addressLine}</p>
    </div>

    <div style="background:#F0EDE6;padding:16px;border-radius:8px">
      <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px">Método de pago</h3>
      <p style="margin:0;font-size:14px">${paymentLabels[body.paymentMethod] ?? body.paymentMethod}</p>
    </div>
  </div>
</div>`

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })

    await transporter.sendMail({
      from: `"Flaash Tienda" <${gmailUser}>`,
      to: gmailUser,
      subject: `🛒 Nuevo pedido #${body.orderId} — ${fmt(body.total)}`,
      html,
    })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Email send error', err)
    return new Response(JSON.stringify({ ok: false, error: 'Failed to send email' }), { status: 200 })
  }
}
