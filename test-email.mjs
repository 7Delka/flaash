import { readFileSync } from 'fs'
import { createTransport } from 'nodemailer'

const lines = readFileSync('.env', 'utf-8').split('\n')
for (const line of lines) {
  const eq = line.indexOf('=')
  if (eq < 0) continue
  const key = line.slice(0, eq).trim()
  const val = line.slice(eq + 1).trim()
  if (key) process.env[key] = val
}

const user = process.env.GMAIL_USER
const pass = process.env.GMAIL_APP_PASSWORD
console.log('Gmail user:', user)
console.log('Password loaded:', !!pass, '| length:', pass?.length)

const transporter = createTransport({ service: 'gmail', auth: { user, pass } })
try {
  await transporter.verify()
  console.log('SMTP OK — credenciales correctas')
  await transporter.sendMail({
    from: `"Flaash Tienda" <${user}>`,
    to: user,
    subject: 'Test email Flaash',
    text: 'Si ves este email, el sistema de notificaciones funciona correctamente.',
  })
  console.log('Email enviado a', user)
} catch (e) {
  console.log('ERROR:', e.message)
}
