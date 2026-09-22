export const IVA_RATE = 0.16 // IVA México

export const SHIPPING_COST_MXN = 170 // ~$10 USD para envíos fuera de zona gratuita

const FREE_SHIPPING_KEYWORDS = [
  // CDMX
  'ciudad de mexico', 'ciudad de méxico', 'cdmx', 'df', 'd.f', 'distrito federal',
  'benito juarez', 'coyoacan', 'iztapalapa', 'tlalpan', 'xochimilco', 'alvaro obregon',
  'cuauhtemoc', 'azcapotzalco', 'iztacalco', 'tlahuac', 'venustiano carranza',
  'miguel hidalgo', 'gustavo a madero', 'cuajimalpa', 'milpa alta', 'la magdalena contreras',
  // Estado de México
  'estado de mexico', 'estado de méxico', 'edomex', 'edo mex', 'edo. mex',
  'huixquilucan', 'naucalpan', 'tlalnepantla', 'ecatepec', 'nezahualcoyotl',
  'nezahualcóyotl', 'atizapan', 'atizapán', 'cuautitlan', 'cuautitlán',
  'tultitlan', 'tultitlán', 'coacalco', 'texcoco', 'chalco', 'ixtapaluca',
  'chimalhuacan', 'chimalhuacán', 'la paz', 'toluca',
]

export function isFreeShippingZone(city: string, state: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase()
  const c = normalize(city)
  const st = normalize(state)
  return FREE_SHIPPING_KEYWORDS.some(k => c.includes(k) || st.includes(k))
}

export function formatMXN(amount: number): string {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
  return formatted + ' MXN'
}

export function parsePriceToNumber(price: string): number {
  const cleaned = price.replace(/[^0-9.]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}
