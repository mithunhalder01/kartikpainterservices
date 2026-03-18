import { useEffect, useRef, useState } from 'react'

function CountUp({ end, suffix, decimal }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      let start = 0
      const duration = 1400
      const steps = duration / 16
      const increment = end / steps
      const timer = setInterval(() => {
        start += increment
        if (start >= end) { setVal(end); clearInterval(timer) }
        else setVal(parseFloat(start.toFixed(decimal)))
      }, 16)
    }, { threshold: 0.4 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} className="font-bold text-stone-800
                               text-[22px] sm:text-[28px]
                               leading-none tabular-nums">
      {val.toFixed(decimal)}{suffix}
    </span>
  )
}

const stats = [
  { end: 500, suffix: '+', decimal: 0, label: 'Projects' },
  { end: 15,  suffix: '+', decimal: 0, label: 'Yrs Exp.' },
  { end: 4.9, suffix: '',  decimal: 1, label: 'Rating'   },
  { end: 100, suffix: '%', decimal: 0, label: 'On-Time'  },
]

export default function StatsCard() {
  return (
    <div className="px-4 sm:px-6 py-6 bg-white">
      <div className="max-w-2xl mx-auto
                      grid grid-cols-4
                      border border-stone-200 rounded-2xl overflow-hidden">
        {stats.map(({ end, suffix, decimal, label }, i) => (
          <div key={label}
            className={`flex flex-col items-center justify-center
                        py-5 px-2 sm:px-4
                        ${i !== stats.length - 1 ? 'border-r border-stone-200' : ''}`}>
            <CountUp end={end} suffix={suffix} decimal={decimal} />
            <span className="text-stone-400 text-[9px] sm:text-[11px]
                             font-medium tracking-widest uppercase mt-1.5">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}