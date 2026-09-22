const WA = 'https://wa.me/5491157988854?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Flaash'

const ContactButton = () => (
  <a
    href={WA}
    target="_blank"
    rel="noopener noreferrer"
    className="cursor-pointer rounded-full font-medium uppercase tracking-widest transition-all duration-200 hover:scale-[1.03] hover:opacity-90 px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base inline-block text-center"
    style={{
      background: 'linear-gradient(135deg, #8B6000 0%, #C8900A 18%, #E8B820 35%, #FFF4C4 50%, #F0D040 65%, #C8A020 82%, #8B6000 100%)',
      boxShadow: '0px 4px 20px rgba(212,175,55,0.35), inset 0 1px 0 rgba(240,208,96,0.3)',
      outline: '2px solid rgba(212,175,55,0.5)',
      outlineOffset: '-3px',
      color: '#0C0C0C',
    }}
  >
    Contactanos
  </a>
)

export default ContactButton
