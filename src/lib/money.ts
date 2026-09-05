export const IVA_RATE = 0.21 // IVA Argentina

// Envío: gratis dentro de Buenos Aires, a cotizar para el resto del país.
const CABA_KEYWORDS = ['buenos aires', 'caba', 'ciudad autonoma', 'ciudad autónoma', 'capital federal', 'gba']

export function isFreeShippingZone(city: string, state: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase()
  const c = normalize(city)
  const st = normalize(state)
  return CABA_KEYWORDS.some(k => c.includes(k) || st.includes(k))
}

export function formatMXN(amount: number): string {
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount)
  return `ARS ${formatted}`
}

export function parsePriceToNumber(price: string): number {
  const cleaned = price.replace(/[^0-9.]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}
