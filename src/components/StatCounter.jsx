import { useEffect, useRef, useState } from 'react'

export default function StatCounter({ end, suffix, decimal, label }) {
  const [val, setVal]     = useState(0)
  const ref               = useRef(null)
  const started           = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration  = 1800
          const startTime = performance.now()

          const easeOut = t => 1 - Math.pow(1 - t, 3)

          const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1)
            setVal(parseFloat((end * easeOut(progress)).toFixed(decimal)))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, decimal])

  return (
    <div ref={ref}>
      <p className="text-[clamp(22px,3.5vw,34px)] font-black text-white
                    leading-none tracking-tight">
        {val.toFixed(decimal)}{suffix}
      </p>
      <p className="text-white/32 text-[10px] font-semibold uppercase
                    tracking-[0.12em] mt-1">
        {label}
      </p>
    </div>
  )
}
