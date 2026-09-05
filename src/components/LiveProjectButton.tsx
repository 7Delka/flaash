interface LiveProjectButtonProps {
  message?: string
}

const LiveProjectButton = ({ message = 'Hola%2C%20quiero%20consultar%20sobre%20un%20producto' }: LiveProjectButtonProps) => (
  <a
    href={`https://wa.me/5491157988854?text=${message}`}
    target="_blank"
    rel="noopener noreferrer"
    className="cursor-pointer rounded-full font-medium uppercase tracking-widest transition-all duration-200 hover:scale-[1.03] px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base inline-block"
    style={{
      border: '2px solid rgba(212,175,55,0.6)',
      color: '#D4AF37',
      background: 'transparent',
    }}
  >
    Consultar
  </a>
)

export default LiveProjectButton
