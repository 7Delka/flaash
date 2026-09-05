import { useEffect, useRef, useState } from 'react'

// Logistics & shipping imagery — containers, planes, ships, cargo, ports
const ALL_IMGS = [
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&h=380&q=80', // containers port
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&h=380&q=80', // airplane sky
  'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=600&h=380&q=80', // aerial port containers
  'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=600&h=380&q=80', // cargo ship ocean
  'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?auto=format&fit=crop&w=600&h=380&q=80', // shipping containers stacked
  'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=600&h=380&q=80', // port aerial
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&h=380&q=80', // truck highway
  'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&h=380&q=80', // warehouse logistics
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&h=380&q=80', // cargo boxes
  'https://images.unsplash.com/photo-1567449303183-ae0d6ed1498e?auto=format&fit=crop&w=600&h=380&q=80', // port cranes
  '/bsm/marquee-port1.jpg',                                                                            // colorful containers (local)
  '/bsm/marquee-port2.jpg',                                                                            // cargo ship sea (local)
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&h=380&q=80', // delivery / logistics
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&h=380&q=80', // plane landing
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&h=380&q=80', // airplane taking off
  'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=600&h=380&q=80', // shipping terminal
  'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=600&h=380&q=80', // cargo containers colorful
  'https://images.unsplash.com/photo-1611095795478-8f13fb4be9e8?auto=format&fit=crop&w=600&h=380&q=80', // logistics map global
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&h=380&q=80', // truck road transport
  'https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=600&h=380&q=80', // container ship sea
]

const ROW1 = [...ALL_IMGS.slice(0, 10), ...ALL_IMGS.slice(0, 10), ...ALL_IMGS.slice(0, 10)]
const ROW2 = [...ALL_IMGS.slice(10), ...ALL_IMGS.slice(10), ...ALL_IMGS.slice(10)]

const MarqueeSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="pt-28 sm:pt-36 md:pt-48 pb-16 overflow-hidden" style={{ background: '#17171A' }}>
      {/* Row 1 — moves right */}
      <div className="flex gap-4 mb-4" style={{ transform: `translateX(${offset - 200}px)`, willChange: 'transform' }}>
        {ROW1.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" className="rounded-2xl object-cover flex-shrink-0"
            style={{ width: 520, height: 330, border: '1px solid rgba(212,175,55,0.12)' }} />
        ))}
      </div>
      {/* Row 2 — moves left */}
      <div className="flex gap-4" style={{ transform: `translateX(${-(offset - 200)}px)`, willChange: 'transform' }}>
        {ROW2.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" className="rounded-2xl object-cover flex-shrink-0"
            style={{ width: 520, height: 330, border: '1px solid rgba(212,175,55,0.12)' }} />
        ))}
      </div>
    </section>
  )
}

export default MarqueeSection
