import { readFileSync } from 'fs'
import Stripe from 'stripe'

const lines = readFileSync('.env', 'utf-8').split('\n')
for (const line of lines) {
  const eq = line.indexOf('=')
  if (eq < 0) continue
  const key = line.slice(0, eq).trim()
  const val = line.slice(eq + 1).trim()
  if (key) process.env[key] = val
}

const sk = process.env.STRIPE_SECRET_KEY
console.log('SK loaded:', !!sk)
console.log('SK prefix:', sk?.slice(0, 30))
console.log('SK length:', sk?.length)

const stripe = new Stripe(sk)
try {
  const pi = await stripe.paymentIntents.create({ amount: 10000, currency: 'mxn' })
  console.log('SUCCESS:', pi.id)
} catch(e) {
  console.log('STRIPE ERROR:', e.type, '-', e.message)
}
