import { motion, type Variants } from 'framer-motion'
import FadeIn from '../components/FadeIn'
import { useLanguage } from '../contexts/LanguageContext'

const cardVariants: Variants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 80, y: 20 }),
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

const ServicesSection = () => {
  const { t } = useLanguage()
  const { badge, heading, reasons } = t.services
  return (
  <section
    id="why-flaash"
    className="relative px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
    style={{ background: '#FAFAF8', zIndex: 30 }}
  >
    <FadeIn>
      <div className="text-center mb-16 sm:mb-20 md:mb-24">
        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.35em] mb-4" style={{ color: 'rgba(200,168,0,0.45)' }}>
          {badge}
        </span>
        <h2
          className="font-black uppercase text-center leading-none"
          style={{
            fontSize: 'clamp(2rem, 5vw, 60px)', letterSpacing: '0.06em',
            background: 'linear-gradient(105deg, #4A2C00 0%, #8B5800 12%, #C8860A 24%, #E0A820 34%, #C89010 44%, #A06808 54%, #C89010 64%, #E0A820 74%, #C8860A 84%, #8B5800 92%, #4A2C00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {heading}
        </h2>
        <div className="mx-auto mt-5" style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(200,168,0,0.3), transparent)' }} />
      </div>
    </FadeIn>

    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      {reasons.map((r, i) => {
        const dir = i % 2 === 0 ? -1 : 1
        return (
          <motion.div
            key={r.num}
            custom={dir}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 4px 24px rgba(212,175,55,0.14)' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative overflow-hidden rounded-[28px] p-7 sm:p-8 cursor-default"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(212,175,55,0.22)',
              boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
            }}
          >
            {/* Ghost watermark */}
            <span
              className="absolute right-4 bottom-0 font-black uppercase select-none pointer-events-none leading-none"
              style={{ fontSize: 'clamp(4rem, 9vw, 90px)', color: 'rgba(212,175,55,0.14)', letterSpacing: '-0.03em' }}
            >
              {r.num}
            </span>

            {/* Gold top accent line */}
            <div className="mb-6" style={{ width: '32px', height: '2px', background: 'linear-gradient(to right, #D4AF37, rgba(212,175,55,0.3))' }} />

            {/* Number badge */}
            <span className="block text-[0.6rem] font-black uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(200,168,0,0.4)' }}>
              {r.num}
            </span>

            {/* Title */}
            <h3
              className="font-semibold uppercase leading-tight tracking-wide mb-4"
              style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)', color: '#D4AF37' }}
            >
              {r.name}
            </h3>

            {/* Description */}
            <p
              className="font-light leading-relaxed"
              style={{ fontSize: 'clamp(0.82rem, 1.3vw, 0.96rem)', color: 'rgba(12,12,12,0.55)', maxWidth: '48ch' }}
            >
              {r.desc}
            </p>
          </motion.div>
        )
      })}
    </div>
  </section>
)
}

export default ServicesSection
