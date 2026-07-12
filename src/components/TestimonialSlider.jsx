import { useState } from 'react'
import { Star } from 'lucide-react'

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
    <div className="w-[300px] sm:w-[340px] shrink-0 p-5 border border-border rounded-xl bg-white
                    flex flex-col hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-dark/20
                    transition-shadow duration-200">
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

/* ── Infinite loop marquee — same on mobile and desktop ── */
export default function TestimonialSlider({ items }) {
  const [paused, setPaused] = useState(false)

  if (!items.length) return null

  // Duplicate the track so the loop point is invisible; speed scales with content length.
  const loop = [...items, ...items]
  const duration = `${Math.max(items.length * 6, 18)}s`

  return (
    <div
      className="relative overflow-hidden"
      style={{ WebkitMaskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)', maskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className="flex gap-4 w-max animate-marquee"
        style={{ '--marquee-duration': duration, animationPlayState: paused ? 'paused' : 'running' }}
      >
        {loop.map((t, i) => (
          <Card key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
    </div>
  )
}
