import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import FadeIn from '../components/FadeIn'
import AnimatedText from '../components/AnimatedText'
import { useLanguage } from '../contexts/LanguageContext'

const AboutSection = () => {
  const { t } = useLanguage()
  const { badge, heading, text, cards } = t.about
  return (
  <section
    id="about"
    className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-24"
    style={{ background: '#FAFAF8' }}
  >
    {/* Decorative lines */}
    <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.25), transparent)' }} />
    <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.25), transparent)' }} />

    {/* Content */}
    <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">

      {/* Heading block */}
      <FadeIn delay={0} y={30}>
        <div className="text-center mb-8 sm:mb-10">
          <span className="block text-[0.6rem] font-bold uppercase tracking-[0.35em] mb-3" style={{ color: 'rgba(212,175,55,0.45)' }}>
            {badge}
          </span>
          <h2
            className="hero-heading font-bold uppercase leading-none tracking-tight text-center"
            style={{ fontSize: 'clamp(2.6rem, 6.5vw, 80px)' }}
          >
            {heading}
          </h2>
          <div className="mx-auto mt-4" style={{ width: '36px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.6), transparent)' }} />
        </div>
      </FadeIn>

      {/* Animated description */}
      <AnimatedText
        text={text}
        className="font-medium text-center leading-relaxed max-w-[600px] mb-20 sm:mb-28"
        style={{ fontSize: 'clamp(1rem, 1.9vw, 1.3rem)', color: 'rgba(12,12,12,0.6)' } as CSSProperties}
      />

      {/* Mission & Vision — luxury editorial layout */}
      <div className="flex flex-col gap-5 w-full max-w-3xl">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ boxShadow: '0 12px 48px rgba(154,112,16,0.12), 0 2px 16px rgba(0,0,0,0.6)' }}
            className="relative overflow-hidden cursor-default flex"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(212,175,55,0.22)',
              borderRadius: 20,
              boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
              minHeight: 160,
            }}
          >
            {/* Left gold accent bar */}
            <div style={{
              position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 2,
              background: 'linear-gradient(to bottom, transparent, #D4AF37, transparent)',
            }} />

            {/* Roman numeral column */}
            <div style={{
              width: 72, flexShrink: 0, borderRight: '1px solid rgba(212,175,55,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2rem 0',
            }}>
              <span
                className="font-black select-none leading-none"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', color: 'rgba(212,175,55,0.3)', letterSpacing: '-0.02em' }}
              >
                {card.num}
              </span>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '2rem 2.5rem', position: 'relative' }}>
              {/* Ghost title watermark */}
              <span
                className="absolute right-4 bottom-0 font-black uppercase select-none pointer-events-none leading-none"
                style={{ fontSize: 'clamp(5rem, 11vw, 110px)', color: 'rgba(212,175,55,0.18)', letterSpacing: '-0.03em' }}
              >
                {card.title}
              </span>

              {/* Supertitle */}
              <span
                className="block font-black uppercase tracking-[0.3em] mb-3"
                style={{ fontSize: '0.55rem', color: 'rgba(212,175,55,0.45)' }}
              >
                {card.title}
              </span>

              {/* Title */}
              <h3
                className="hero-heading font-bold uppercase leading-none mb-4"
                style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', letterSpacing: '-0.01em' }}
              >
                {card.title}
              </h3>

              {/* Gold thin divider */}
              <div style={{ width: 32, height: 1, background: 'rgba(212,175,55,0.35)', marginBottom: '1.1rem' }} />

              {/* Text */}
              <p
                className="font-light leading-relaxed relative z-10"
                style={{ fontSize: 'clamp(0.8rem, 1.2vw, 0.92rem)', color: 'rgba(12,12,12,0.55)', maxWidth: '52ch', lineHeight: 1.85 }}
              >
                {card.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)
}

export default AboutSection
