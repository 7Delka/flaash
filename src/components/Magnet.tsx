import { useRef, useState, useCallback, type ReactNode } from 'react'

interface MagnetProps {
  children: ReactNode
  padding?: number
  strength?: number
  activeTransition?: string
  inactiveTransition?: string
  className?: string
}

const Magnet = ({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className,
}: MagnetProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const inBounds =
        Math.abs(distX) < rect.width / 2 + padding &&
        Math.abs(distY) < rect.height / 2 + padding

      if (inBounds) {
        setActive(true)
        setPos({ x: distX / strength, y: distY / strength })
      } else {
        setActive(false)
        setPos({ x: 0, y: 0 })
      }
    },
    [padding, strength]
  )

  const handleMouseLeave = useCallback(() => {
    setActive(false)
    setPos({ x: 0, y: 0 })
  }, [])

  const attachListeners = useCallback(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
  }, [handleMouseMove, handleMouseLeave])

  const detachListeners = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseleave', handleMouseLeave)
    setActive(false)
    setPos({ x: 0, y: 0 })
  }, [handleMouseMove, handleMouseLeave])

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={attachListeners}
      onMouseLeave={detachListeners}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: active ? activeTransition : inactiveTransition,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}

export default Magnet
