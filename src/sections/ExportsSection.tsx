import { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import FadeIn from '../components/FadeIn'
import LiveProjectButton from '../components/LiveProjectButton'

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`

interface ExportCard {
  num: string
  name: string
  desc: string
  badge: string
  waMsg: string
  col1img1: string
  col1img2: string
  col2img: string
}

const EXPORTS: ExportCard[] = [
  {
    num: '01', name: 'Carne Vacuna Congelada', badge: 'Exportación',
    desc: 'Carne vacuna premium con trazabilidad completa, certificada para Europa, Asia y Medio Oriente.',
    waMsg: 'Hola%2C%20me%20interesa%20exportar%20Carne%20Vacuna%20Congelada',
    col1img1: U('1546069901-ba9599a7e63c'), col1img2: U('1529042410759-befb1204b468'), col2img: U('1544025162-d76694265947'),
  },
  {
    num: '02', name: 'Carne de Cabra y Oveja', badge: 'Exportación',
    desc: 'Carnes patagónicas de sabor inigualable, bajo contenido graso, ideales para mercados gourmet.',
    waMsg: 'Hola%2C%20me%20interesa%20exportar%20Carne%20de%20Cabra%20y%20Oveja',
    col1img1: '/bsm/ovejas.jpg', col1img2: U('1546069901-ba9599a7e63c'), col2img: U('1500595046743-cd271d694d30'),
  },
  {
    num: '03', name: 'Hacienda en Pie', badge: 'Exportación',
    desc: 'Exportación de ganado bovino con logística especializada y cumplimiento de normativas internacionales.',
    waMsg: 'Hola%2C%20me%20interesa%20exportar%20Hacienda%20en%20Pie',
    col1img1: U('1500595046743-cd271d694d30'), col1img2: '/bsm/ovejas.jpg', col2img: U('1546069901-ba9599a7e63c'),
  },
  {
    num: '04', name: 'Quesos Argentinos', badge: 'Exportación',
    desc: 'Cremoso, mozzarella, provolone y especialidades regionales. La tradición quesera argentina al mundo.',
    waMsg: 'Hola%2C%20me%20interesa%20exportar%20Quesos%20Argentinos',
    col1img1: U('1452195100486-9cc805987862'), col1img2: U('1486297678162-eb2a19b0a318'), col2img: U('1452195100486-9cc805987862'),
  },
  {
    num: '05', name: 'Vinos Argentinos', badge: 'Exportación',
    desc: 'Malbec, Torrontés, Cabernet Sauvignon y Chardonnay. Argentina, top 5 productor mundial.',
    waMsg: 'Hola%2C%20me%20interesa%20exportar%20Vinos%20Argentinos',
    col1img1: U('1510812431401-41d2bd2722f3'), col1img2: U('1546069901-ba9599a7e63c'), col2img: U('1510812431401-41d2bd2722f3'),
  },
  {
    num: '06', name: 'Dulce de Leche', badge: 'Exportación',
    desc: 'El sabor icónico de Argentina en formato retail, industrial y foodservice para el mundo.',
    waMsg: 'Hola%2C%20me%20interesa%20exportar%20Dulce%20de%20Leche',
    col1img1: '/bsm/dulce.jpg', col1img2: U('1546069901-ba9599a7e63c'), col2img: U('1529042410759-befb1204b468'),
  },
  {
    num: '07', name: 'Alfajores', badge: 'Exportación',
    desc: 'Alfajores artesanales y de chocolate en múltiples variantes. El dulce embajador argentino.',
    waMsg: 'Hola%2C%20me%20interesa%20exportar%20Alfajores',
    col1img1: '/bsm/alfajor.jpg', col1img2: '/bsm/dulce.jpg', col2img: U('1544025162-d76694265947'),
  },
  {
    num: '08', name: 'Mermeladas Artesanales', badge: 'Exportación',
    desc: 'Frutilla, ciruela, durazno, pera, membrillo y berries mixtos. Opciones orgánicas disponibles.',
    waMsg: 'Hola%2C%20me%20interesa%20exportar%20Mermeladas%20Artesanales',
    col1img1: '/bsm/mermelada.jpg', col1img2: U('1546069901-ba9599a7e63c'), col2img: U('1452195100486-9cc805987862'),
  },
  {
    num: '09', name: 'Yerba Mate', badge: 'Exportación',
    desc: 'Múltiples variedades con demanda creciente en Europa, América del Norte y Medio Oriente.',
    waMsg: 'Hola%2C%20me%20interesa%20exportar%20Yerba%20Mate',
    col1img1: '/bsm/yerba.jpeg', col1img2: '/bsm/mermelada.jpg', col2img: U('1500595046743-cd271d694d30'),
  },
]

const TOTAL = EXPORTS.length

interface CardProps {
  item: ExportCard
  index: number
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
}

const ExportCard = ({ item, index, scrollYProgress }: CardProps) => {
  const targetScale = 1 - (TOTAL - 1 - index) * 0.02
  const scale = useTransform(scrollYProgress, [index / TOTAL, (index + 1) / TOTAL], [1, targetScale])

  return (
    <div className="h-[88vh] flex items-start" style={{ position: 'sticky', top: `${88 + index * 22}px` }}>
      <motion.div
        className="w-full rounded-[36px] sm:rounded-[44px] md:rounded-[52px] p-4 sm:p-6 md:p-8"
        style={{
          scale,
          transformOrigin: 'top center',
          background: '#0A0A0A',
          border: '1px solid rgba(212,175,55,0.25)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-4 md:mb-5 gap-4 flex-wrap">
          <div className="flex items-baseline gap-4 md:gap-5">
            <span className="font-black leading-none" style={{ fontSize: 'clamp(2rem, 5vw, 70px)', color: 'rgba(212,175,55,0.3)' }}>
              {item.num}
            </span>
            <div className="flex flex-col">
              <span className="font-light uppercase tracking-widest text-[0.65rem]" style={{ color: 'rgba(212,175,55,0.55)' }}>
                {item.badge}
              </span>
              <span className="font-medium uppercase tracking-wide leading-tight" style={{ fontSize: 'clamp(1rem, 2vw, 1.8rem)', color: '#F5F0E8' }}>
                {item.name}
              </span>
              <span className="font-light text-xs sm:text-sm mt-0.5 max-w-xs" style={{ color: 'rgba(245,240,232,0.5)' }}>
                {item.desc}
              </span>
            </div>
          </div>
          <LiveProjectButton message={item.waMsg} />
        </div>

        {/* Image grid */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-3" style={{ width: '40%' }}>
            <img src={item.col1img1} alt={item.name} loading="lazy"
              className="w-full rounded-[28px] sm:rounded-[36px] object-cover"
              style={{ height: 'clamp(110px, 14vw, 200px)' }} />
            <img src={item.col1img2} alt={item.name} loading="lazy"
              className="w-full rounded-[28px] sm:rounded-[36px] object-cover"
              style={{ height: 'clamp(140px, 20vw, 300px)' }} />
          </div>
          <div style={{ width: '60%' }}>
            <img src={item.col2img} alt={item.name} loading="lazy"
              className="w-full h-full rounded-[28px] sm:rounded-[36px] object-cover" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const ExportsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })

  return (
    <section
      id="exportaciones"
      ref={containerRef}
      className="rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-8 relative z-10 px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-32"
      style={{ background: '#0C0C0C' }}
    >
      <FadeIn>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-4"
          style={{ fontSize: 'clamp(3rem, 12vw, 150px)' }}
        >
          Exportaciones
        </h2>
        <p className="text-center mb-16 sm:mb-20 md:mb-28 font-light"
          style={{ color: 'rgba(245,240,232,0.5)', fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)' }}>
          9 categorías · Productos argentinos al mundo
        </p>
      </FadeIn>

      <div>
        {EXPORTS.map((item, i) => (
          <ExportCard key={item.num} item={item} index={i} scrollYProgress={scrollYProgress} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-32 flex flex-col items-center gap-6 text-center">
        <p className="font-light" style={{ color: 'rgba(245,240,232,0.45)', fontSize: 'clamp(0.85rem, 1.4vw, 1.1rem)', maxWidth: 520 }}>
          Conectando Argentina con el mundo. Comercio internacional con visión estratégica, compromiso de largo plazo y dedicación en cada operación.
        </p>
        <a
          href="https://wa.me/5491157988854?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20Flaash"
          target="_blank" rel="noopener noreferrer"
          className="px-10 py-4 rounded-full font-medium uppercase tracking-widest text-sm transition-all duration-200 hover:scale-[1.03]"
          style={{
            background: 'linear-gradient(135deg,#2b1d00 0%,#4a3400 22%,#f0d060 45%,#fff8dc 55%,#c89800 68%,#2a1c00 85%,#2b1d00 100%)',
            color: '#0C0C0C',
            fontWeight: 700,
            boxShadow: '0 4px 24px rgba(212,175,55,0.3)',
          }}
        >
          Contactanos por WhatsApp
        </a>
        <p className="text-xs" style={{ color: 'rgba(245,240,232,0.25)' }}>
          © 2025 Flaash · corpobsm@gmail.com
        </p>
      </div>
    </section>
  )
}

export default ExportsSection
