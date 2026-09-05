import { cn } from '@/lib/utils'

interface GlobeProps {
  className?: string
}

export default function Globe({ className }: GlobeProps) {
  return (
    <>
      <style>{`
        @keyframes earthRotate {
          0%   { background-position: 0 0; }
          100% { background-position: 640px 0; }
        }
        @keyframes twinkle-a { 0%,100%{opacity:.1} 50%{opacity:1} }
        @keyframes twinkle-b { 0%,100%{opacity:.1} 50%{opacity:.9} }
        @keyframes twinkle-c { 0%,100%{opacity:.1} 50%{opacity:.8} }
      `}</style>

      {/* Sun glow behind the globe */}
      <div style={{
        position: 'absolute',
        inset: '-100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,210,60,0.38) 0%, rgba(220,140,0,0.22) 35%, rgba(160,80,0,0.09) 60%, transparent 75%)',
        filter: 'blur(28px)',
        pointerEvents: 'none',
        zIndex: -1,
      }} />

      <div
        className={cn('relative w-[400px] h-[400px] rounded-full overflow-hidden', className)}
        style={{
          backgroundImage: "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/globe.jpeg')",
          backgroundSize: '640px 400px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: '0 0',
          animation: 'earthRotate 30s linear infinite',
          filter: 'saturate(1.2) contrast(1.05) brightness(1.0)',
          boxShadow: [
            '0 0 80px rgba(255,180,20,0.35)',
            '-5px 0 8px #a8d8ee inset',
            '15px 2px 24px #000 inset',
            '-24px -2px 32px #b0d8ee99 inset',
            '400px 0 42px #00000066 inset',
            '230px 0 36px #000000aa inset',
          ].join(','),
        }}
      >
      </div>
    </>
  )
}
