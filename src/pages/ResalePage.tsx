import NavBar from '../components/NavBar'
import ContactFooter from '../components/ContactFooter'
import ResaleProductsSection from '../sections/ResaleProductsSection'

export default function ResalePage() {
  return (
    <div style={{ background: '#F8F7F4', minHeight: '100vh' }}>
      <NavBar />
      <main className="pt-20">
        <ResaleProductsSection />
      </main>
      <ContactFooter />
    </div>
  )
}
