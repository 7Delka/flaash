import { motion } from 'framer-motion'
import FadeIn from '../components/FadeIn'
import { useLanguage } from '../contexts/LanguageContext'

const Stars = () => (
  <div className="flex gap-1 mb-4">
    {[...Array(5)].map((_, i) => (
      <svg key={i} viewBox="0 0 20 20" fill="#D4AF37" className="w-4 h-4">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

export default function TestimonialsSection() {
  const { t } = useLanguage()
  const { badge, heading, items } = t.testimonials

  return (
    <section
      id="testimonials"
      className="relative px-5 sm:px-8 md:px-10 py-20 sm:py-28 md:py-32"
      style={{ background: '#FAFAF8' }}
    >
      {/* Top/bottom subtle gold lines */}
      <div className="absolute top-0 left-0 w-full h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.2), transparent)' }} />
      <div className="absolute bottom-0 left-0 w-full h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.2), transparent)' }} />

      {/* Heading */}
      <FadeIn>
        <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
          <span className="block text-[0.6rem] font-bold uppercase tracking-[0.35em] mb-3"
            style={{ color: 'rgba(212,175,55,0.45)' }}>
            {badge}
          </span>
          <h2
            className="hero-heading font-bold uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 68px)' }}
          >
            {heading}
          </h2>
          <div className="mx-auto mt-4"
            style={{ width: 36, height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.55), transparent)' }} />
        </div>
      </FadeIn>

      {/* Cards grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <motion.div
            key={item.company}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.25)' }}
            className="relative flex flex-col rounded-[24px] p-6 sm:p-7 cursor-default"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(212,175,55,0.22)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            }}
          >
            {/* Ghost watermark initials */}
            <span
              className="absolute right-3 bottom-0 font-black select-none pointer-events-none leading-none"
              style={{ fontSize: 'clamp(4.5rem, 8vw, 88px)', color: 'rgba(212,175,55,0.14)', letterSpacing: '-0.03em' }}
            >
              {item.initials}
            </span>

            {/* Gold top accent */}
            <div style={{ width: 28, height: 2, background: 'linear-gradient(to right, #D4AF37, rgba(212,175,55,0.2))', marginBottom: '1.25rem' }} />

            <Stars />

            {/* Quote */}
            <p
              className="font-light leading-relaxed flex-1 mb-6"
              style={{ fontSize: 'clamp(0.83rem, 1.2vw, 0.93rem)', color: 'rgba(12,12,12,0.6)', lineHeight: 1.8 }}
            >
              "{item.quote}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 mt-auto">
              {/* Avatar with initials */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full font-black text-[0.6rem] tracking-wider select-none"
                style={{
                  width: 38, height: 38,
                  background: 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)',
                  color: '#0C0C0C',
                  letterSpacing: '0.05em',
                }}
              >
                {item.initials}
              </div>
              <div>
                <span
                  className="block font-semibold uppercase leading-tight"
                  style={{ fontSize: 'clamp(0.6rem, 0.9vw, 0.72rem)', color: 'rgba(212,175,55,0.85)', letterSpacing: '0.06em' }}
                >
                  {item.company}
                </span>
                <span
                  className="block font-light"
                  style={{ fontSize: '0.72rem', color: 'rgba(12,12,12,0.4)', marginTop: 1 }}
                >
                  {item.role}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
