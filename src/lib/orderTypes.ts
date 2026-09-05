export type PaymentMethod = 'card' | 'oxxo' | 'transfer' | 'mplink'

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded'

export interface OrderLineItem {
  id: string
  name: string
  unitPrice: number
  qty: number
}

export interface CustomerInfo {
  fullName: string
  email: string
  phone: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
}

export interface Order {
  id: string
  items: OrderLineItem[]
  subtotal: number
  iva: number
  shipping: number
  total: number
  currency: 'MXN'
  customer: CustomerInfo
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  mpPreferenceId?: string
  mpPaymentId?: string
  createdAt: string
  updatedAt: string
}
