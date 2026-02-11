import { useEffect, useState } from 'react'

type AnimatedNumberProps = {
  value: number
  duration?: number
  suffix?: string
  decimals?: number
}

export default function AnimatedNumber({
  value,
  duration = 900,
  suffix = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let frame = 0
    const totalFrames = Math.max(1, Math.round(duration / 16))
    const startValue = displayValue
    const delta = value - startValue

    const tick = () => {
      frame += 1
      const progress = Math.min(frame / totalFrames, 1)
      const nextValue = startValue + delta * progress
      setDisplayValue(nextValue)
      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [value, duration])

  return (
    <span>
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  )
}
