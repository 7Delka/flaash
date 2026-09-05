import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react'
import { IVA_RATE } from '../lib/money'

export interface CartItem {
  id: string
  name: string
  image: string
  unitPrice: number // MXN, sin IVA
  qty: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  removeItem: (id: string) => void
  setQty: (id: string, qty: number) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
  count: number
  subtotal: number
  iva: number
  total: number // subtotal + iva — el envío se determina en el checkout según la dirección
  lastAdded: CartItem | null
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'flaash-cart-v1'

function loadInitial(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitial)
  const [isOpen, setIsOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // localStorage unavailable (private mode, etc.) — cart just won't persist
    }
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { ...item, qty }]
    })
    setLastAdded({ ...item, qty })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id))
      return
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }, [])

  const increment = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i))
  }, [])

  const decrement = useCallback((id: string) => {
    setItems(prev => prev.flatMap(i => {
      if (i.id !== id) return [i]
      if (i.qty <= 1) return []
      return [{ ...i, qty: i.qty - 1 }]
    }))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const { count, subtotal, iva, total } = useMemo(() => {
    const count = items.reduce((a, i) => a + i.qty, 0)
    const subtotal = items.reduce((a, i) => a + i.unitPrice * i.qty, 0)
    const iva = subtotal * IVA_RATE
    const total = subtotal + iva
    return { count, subtotal, iva, total }
  }, [items])

  const value: CartContextValue = {
    items, addItem, removeItem, setQty, increment, decrement, clear,
    isOpen, open, close,
    count, subtotal, iva, total, lastAdded,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
