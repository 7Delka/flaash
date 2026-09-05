import { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import FadeIn from '../components/FadeIn'
import LiveProjectButton from '../components/LiveProjectButton'

// Unsplash helpers
const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`

interface ImportCard {
  num: string
  name: string
  desc: string
  badge: string
  waMsg: string
  col1img1: string
  col1img2: string
  col2img: string
}

const IMPORTS: ImportCard[] = [
  {
    num: '01', name: 'Electrónica', badge: 'Importación',
    desc: 'Smartphones, tablets, audio, video y wearables de las mejores marcas internacionales.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Electr%C3%B3nica',
    col1img1: U('1498049794561-7780e7231661'), col1img2: U('1518770660439-4636190af475'), col2img: U('1558002038-1055907df827'),
  },
  {
    num: '02', name: 'Herramientas', badge: 'Importación',
    desc: 'Herramientas manuales, eléctricas, maquinaria y equipos de medición para profesionales.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Herramientas',
    col1img1: U('1572981779307-38b8cabb2407'), col1img2: U('1504148455328-c376907f081c'), col2img: U('1416879595882-3373a0480b5b'),
  },
  {
    num: '03', name: 'Hogar y Decoración', badge: 'Importación',
    desc: 'Decoración, textiles para el hogar, vajilla y utensilios de cocina de diseño internacional.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Hogar%20y%20Decoraci%C3%B3n',
    col1img1: U('1555041469-a586c61ea9bc'), col1img2: U('1556909114-f6e7ad7d3136'), col2img: U('1507089947368-19c1da9775ae'),
  },
  {
    num: '04', name: 'Baños y Sanitarios', badge: 'Importación',
    desc: 'Grifería, accesorios para baño, espejos y dispensadores de alta calidad.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Ba%C3%B1os%20y%20Sanitarios',
    col1img1: U('1552321554-5fefe8c9ef14'), col1img2: U('1555041469-a586c61ea9bc'), col2img: U('1552321554-5fefe8c9ef14'),
  },
  {
    num: '05', name: 'Exterior y Jardín', badge: 'Importación',
    desc: 'Muebles de exterior, herramientas de jardinería y sistemas de riego profesionales.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Exterior%20y%20Jard%C3%ADn',
    col1img1: U('1416879595882-3373a0480b5b'), col1img2: U('1500595046743-cd271d694d30'), col2img: U('1416879595882-3373a0480b5b'),
  },
  {
    num: '06', name: 'Automotor', badge: 'Importación',
    desc: 'Accesorios para vehículos, repuestos, electrónica automotriz y equipos de performance.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Automotor',
    col1img1: U('1492144534655-ae79c964c9d7'), col1img2: U('1572981779307-38b8cabb2407'), col2img: U('1492144534655-ae79c964c9d7'),
  },
  {
    num: '07', name: 'Electrodomésticos', badge: 'Importación',
    desc: 'Pequeños y grandes electrodomésticos, línea blanca y equipamiento de cocina profesional.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Electrodom%C3%A9sticos',
    col1img1: U('1556909114-f6e7ad7d3136'), col1img2: U('1555041469-a586c61ea9bc'), col2img: U('1556909114-f6e7ad7d3136'),
  },
  {
    num: '08', name: 'Indumentaria y Calzado', badge: 'Importación',
    desc: 'Ropa casual, calzado de moda, accesorios y prendas de temporada para todas las edades.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Indumentaria%20y%20Calzado',
    col1img1: U('1489987707849-ff9a97d3b36e'), col1img2: U('1522335789203-aabd1fc54bc9'), col2img: U('1489987707849-ff9a97d3b36e'),
  },
  {
    num: '09', name: 'Juguetes', badge: 'Importación',
    desc: 'Juguetes educativos, juegos de mesa, figuras coleccionables y peluches para niños.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Juguetes',
    col1img1: U('1517649763962-0c623066013b'), col1img2: U('1587300003388-59208cc962cb'), col2img: U('1555041469-a586c61ea9bc'),
  },
  {
    num: '10', name: 'Artículos Deportivos', badge: 'Importación',
    desc: 'Equipamiento de fitness, artículos deportivos y gear para actividades al aire libre.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Art%C3%ADculos%20Deportivos',
    col1img1: U('1517649763962-0c623066013b'), col1img2: U('1559757148-5c350d0d3c56'), col2img: U('1517649763962-0c623066013b'),
  },
  {
    num: '11', name: 'Iluminación', badge: 'Importación',
    desc: 'Artefactos LED, luces de pared, tiras de luz y soluciones de iluminación inteligente.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Iluminaci%C3%B3n',
    col1img1: U('1565814636199-ae8133055c1c'), col1img2: U('1555041469-a586c61ea9bc'), col2img: U('1565814636199-ae8133055c1c'),
  },
  {
    num: '12', name: 'Belleza y Cuidado Personal', badge: 'Importación',
    desc: 'Skincare, maquillaje, cuidado del cabello y fragancias de marcas internacionales.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Belleza%20y%20Cuidado%20Personal',
    col1img1: U('1522335789203-aabd1fc54bc9'), col1img2: U('1559757148-5c350d0d3c56'), col2img: U('1522335789203-aabd1fc54bc9'),
  },
  {
    num: '13', name: 'Mascotas y Animales', badge: 'Importación',
    desc: 'Alimentos premium, accesorios, juguetes y productos de higiene para tus mascotas.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Mascotas%20y%20Animales',
    col1img1: U('1587300003388-59208cc962cb'), col1img2: U('1416879595882-3373a0480b5b'), col2img: U('1587300003388-59208cc962cb'),
  },
  {
    num: '14', name: 'Salud y Bienestar', badge: 'Importación',
    desc: 'Suplementos, vitaminas, dispositivos médicos y equipos de masajes y relajación.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Salud%20y%20Bienestar',
    col1img1: U('1559757148-5c350d0d3c56'), col1img2: U('1517649763962-0c623066013b'), col2img: U('1559757148-5c350d0d3c56'),
  },
  {
    num: '15', name: 'Tecnología del Hogar', badge: 'Importación',
    desc: 'Parlantes inteligentes, automatización, cámaras de seguridad y domótica avanzada.',
    waMsg: 'Hola%2C%20me%20interesa%20importar%20Tecnolog%C3%ADa%20del%20Hogar',
    col1img1: U('1558002038-1055907df827'), col1img2: U('1498049794561-7780e7231661'), col2img: U('1558002038-1055907df827'),
  },
  {
    num: '16', name: 'Otras Categorías', badge: 'Importación',
    desc: '¿No encontrás lo que buscás? Consultanos. Gestionamos sourcing personalizado para cualquier producto.',
    waMsg: 'Hola%2C%20quiero%20consultar%20sobre%20una%20categor%C3%ADa%20espec%C3%ADfica%20de%20importaci%C3%B3n',
    col1img1: U('1555041469-a586c61ea9bc'), col1img2: U('1498049794561-7780e7231661'), col2img: U('1416879595882-3373a0480b5b'),
  },
]

const TOTAL = IMPORTS.length

interface CardProps {
  item: ImportCard
  index: number
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
}

const ImportCard = ({ item, index, scrollYProgress }: CardProps) => {
  const targetScale = 1 - (TOTAL - 1 - index) * 0.015
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
            <span className="font-black leading-none" style={{ fontSize: 'clamp(2rem, 5vw, 70px)', color: 'rgba(212,175,55,0.5)' }}>
              {item.num}
            </span>
            <div className="flex flex-col">
              <span className="font-light uppercase tracking-widest text-[0.65rem]" style={{ color: 'rgba(212,175,55,0.55)' }}>
                {item.badge}
              </span>
              <span className="hero-heading font-black uppercase tracking-wide leading-tight" style={{ fontSize: 'clamp(1rem, 2vw, 1.8rem)' }}>
                {item.name}
              </span>
              <span className="font-light text-xs sm:text-sm mt-0.5 max-w-xs" style={{ color: 'rgba(212,175,55,0.65)' }}>
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

const ProjectsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })

  return (
    <section
      id="importaciones"
      ref={containerRef}
      className="rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-8 relative z-10 px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-20"
      style={{ background: '#0C0C0C' }}
    >
      <FadeIn>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-4"
          style={{ fontSize: 'clamp(3rem, 12vw, 150px)' }}
        >
          Importaciones
        </h2>
        <p className="text-center mb-16 sm:mb-20 md:mb-28 font-light"
          style={{ color: 'rgba(245,240,232,0.5)', fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)' }}>
          16 categorías disponibles · Consultá por WhatsApp
        </p>
      </FadeIn>

      <div>
        {IMPORTS.map((item, i) => (
          <ImportCard key={item.num} item={item} index={i} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </section>
  )
}

export default ProjectsSection
