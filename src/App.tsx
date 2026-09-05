import NavBar from './components/NavBar'
import ScrollExpandHero from './sections/ScrollExpandHero'
import MarqueeSection from './sections/MarqueeSection'
import AboutSection from './sections/AboutSection'
import ServicesSection from './sections/ServicesSection'
import HeroSplit from './sections/HeroSplit'
import TestimonialsSection from './sections/TestimonialsSection'
import ContactFooter from './components/ContactFooter'
function HomePage() {
  return (
    <div style={{ background: '#FAFAF8', overflowX: 'clip' }}>
      <NavBar />
      <ScrollExpandHero />
      <AboutSection />
      <MarqueeSection />
      <ServicesSection />
      <HeroSplit />
      <TestimonialsSection />
      <ContactFooter />
    </div>
  )
}

export default HomePage
