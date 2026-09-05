import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import ImportacionesPage from './pages/ImportacionesPage.tsx'
import ExportacionesPage from './pages/ExportacionesPage.tsx'
import ProductsPage from './pages/ProductsPage.tsx'
import ProductDetailPage from './pages/ProductDetailPage.tsx'
import ResalePage from './pages/ResalePage.tsx'
import CartPage from './pages/CartPage.tsx'
import CheckoutPage from './pages/CheckoutPage.tsx'
import OrderStatusPage from './pages/OrderStatusPage.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import WhatsAppFloat from './components/WhatsAppFloat.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { CartProvider } from './contexts/CartContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/productos" element={<ResalePage />} />
            <Route path="/imports" element={<ImportacionesPage />} />
            <Route path="/exports" element={<ExportacionesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:orderId" element={<OrderStatusPage />} />
          </Routes>
          <WhatsAppFloat />
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  </StrictMode>,
)
