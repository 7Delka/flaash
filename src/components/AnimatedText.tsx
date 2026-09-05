import { useRef } from 'react'
import { useScroll, useTransform, motion, type MotionValue } from 'framer-motion'

interface WordSpanProps {
  word: string
  scrollYProgress: MotionValue<number>
  index: number
  total: number
}

// Animates one word at a time — inline span so browser can break lines between words normally
function WordSpan({ word, scrollYProgress, index, total }: WordSpanProps) {
  const start = index / total
  const end = Math.min((index + 1) / total, 1)
  const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1])

  return (
    <motion.span style={{ opacity }}>
      {word}
    </motion.span>
  )
}

interface AnimatedTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.95', 'start 0.4'],
  })

  const words = text.split(' ')

  return (
    <p ref={ref} className={className} style={style} aria-label={text}>
      {words.map((word, i) => (
        <span key={i}>
          <WordSpan
            word={word}
            scrollYProgress={scrollYProgress}
            index={i}
            total={words.length}
          />
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </p>
  )
}
