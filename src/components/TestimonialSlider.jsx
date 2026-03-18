import { useState, useRef, useEffect, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

function StarRow({ n = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} className="star-filled" />
      ))}
    </div>
  )
}

function Card({ t }) {
  return (
    <div className="p-5 border border-border rounded-xl bg-white h-full flex flex-col">
      <StarRow n={t.stars} />
      <p className="text-text-secondary text-[13px] leading-relaxed mt-3 mb-5 italic flex-1">
        "{t.text}"
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center
                        font-semibold text-[13px] text-text-muted flex-shrink-0">
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-text-primary text-[13px]">{t.name}</p>
          <p className="text-text-subtle text-[11px] mt-0.5">{t.loc}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Mobile Carousel ───────────────────────────────── */
function MobileCarousel({ items }) {
  const [active, setActive]   = useState(0)
  const touchStart             = useRef(null)
  const touchEnd               = useRef(null)
  const autoRef                = useRef(null)
  const MIN_SWIPE              = 50

  const goTo = useCallback((idx) => {
    setActive((idx + items.length) % items.length)
  }, [items.length])

  const next = useCallback(() => goTo(active + 1), [active, goTo])
  const prev = useCallback(() => goTo(active - 1), [active, goTo])

  /* Auto-play */
  useEffect(() => {
    autoRef.current = setInterval(next, 4500)
    return () => clearInterval(autoRef.current)
  }, [next])

  const resetAuto = () => {
    clearInterval(autoRef.current)
    autoRef.current = setInterval(next, 4500)
  }

  /* Touch handlers */
  const onTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX }
  const onTouchMove  = (e) => { touchEnd.current   = e.targetTouches[0].clientX }
  const onTouchEnd   = () => {
    if (!touchStart.current || !touchEnd.current) return
    const delta = touchStart.current - touchEnd.current
    if (Math.abs(delta) >= MIN_SWIPE) {
      delta > 0 ? next() : prev()
      resetAuto()
    }
    touchStart.current = null
    touchEnd.current   = null
  }

  return (
    <div className="relative select-none">
      {/* Card track */}
      <div
        className="overflow-hidden rounded-xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {items.map((t) => (
            <div key={t.name} className="min-w-full px-1">
              <Card t={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={() => { prev(); resetAuto() }}
        aria-label="Previous review"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3
                   w-8 h-8 bg-white border border-border rounded-full
                   flex items-center justify-center shadow-sm
                   hover:border-dark transition-colors"
      >
        <ChevronLeft size={15} className="text-text-muted" />
      </button>
      <button
        onClick={() => { next(); resetAuto() }}
        aria-label="Next review"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3
                   w-8 h-8 bg-white border border-border rounded-full
                   flex items-center justify-center shadow-sm
                   hover:border-dark transition-colors"
      >
        <ChevronRight size={15} className="text-text-muted" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetAuto() }}
            aria-label={`Go to review ${i + 1}`}
            className={`rounded-full transition-all duration-200
              ${active === i
                ? 'w-5 h-1.5 bg-dark'
                : 'w-1.5 h-1.5 bg-border hover:bg-text-subtle'
              }`}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Desktop Grid ──────────────────────────────────── */
function DesktopGrid({ items }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((t) => (
        <div key={t.name}
             className="hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                        hover:border-dark/20 transition-all duration-200 rounded-xl">
          <Card t={t} />
        </div>
      ))}
    </div>
  )
}

/* ── Main export ───────────────────────────────────── */
export default function TestimonialSlider({ items }) {
  return (
    <>
      {/* Mobile: carousel */}
      <div className="md:hidden px-4">
        <MobileCarousel items={items} />
      </div>
      {/* Desktop: grid */}
      <div className="hidden md:block">
        <DesktopGrid items={items} />
      </div>
    </>
  )
}
