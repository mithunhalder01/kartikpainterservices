import { useMemo, useState } from 'react'

const ACCENT = '#E07A3A'
const WIDTH = 600
const HEIGHT = 180
const PAD = { top: 12, right: 12, bottom: 24, left: 12 }

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function LeadsTrendChart({ data }) {
  const [hoverIdx, setHoverIdx] = useState(null)

  const { points, path, areaPath } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.count))
    const innerW = WIDTH - PAD.left - PAD.right
    const innerH = HEIGHT - PAD.top - PAD.bottom
    const step = data.length > 1 ? innerW / (data.length - 1) : 0

    const pts = data.map((d, i) => ({
      x: PAD.left + step * i,
      y: PAD.top + innerH - (d.count / max) * innerH,
      ...d,
    }))

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${PAD.top + innerH} L ${pts[0].x.toFixed(1)} ${PAD.top + innerH} Z`

    return { points: pts, path: line, areaPath: area }
  }, [data])

  const handleMove = (e) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - x)
      if (dist < closestDist) { closestDist = dist; closest = i }
    })
    setHoverIdx(closest)
  }

  const hovered = hoverIdx !== null ? points[hoverIdx] : points[points.length - 1]
  const gridY = [0, 0.5, 1].map((f) => PAD.top + (HEIGHT - PAD.top - PAD.bottom) * f)

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-[180px] overflow-visible"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {gridY.map((y) => (
          <line key={y} x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="#E5E5E5" strokeWidth="1" />
        ))}

        <path d={areaPath} fill={ACCENT} fillOpacity="0.1" stroke="none" />
        <path d={path} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {hoverIdx !== null && (
          <line
            x1={points[hoverIdx].x} x2={points[hoverIdx].x}
            y1={PAD.top} y2={HEIGHT - PAD.bottom}
            stroke="#A3A3A3" strokeWidth="1"
          />
        )}

        {/* endpoint marker, always visible */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={ACCENT} stroke="#fff" strokeWidth="2" />
        {hoverIdx !== null && (
          <circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r="4" fill={ACCENT} stroke="#fff" strokeWidth="2" />
        )}

        <text x={points[0].x} y={HEIGHT - 6} fontSize="10" fill="#737373">{formatDate(points[0].date)}</text>
        <text x={points[points.length - 1].x} y={HEIGHT - 6} fontSize="10" fill="#737373" textAnchor="end">
          {formatDate(points[points.length - 1].date)}
        </text>
      </svg>

      {hovered && (
        <div
          className="absolute top-1 px-2.5 py-1.5 bg-dark text-white rounded-md text-[11px] pointer-events-none shadow-lg whitespace-nowrap w-max"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            transform: hovered.x > WIDTH * 0.75 ? 'translateX(-100%)' : hovered.x < WIDTH * 0.25 ? 'none' : 'translateX(-50%)',
          }}
        >
          <span className="font-semibold">{hovered.count}</span> lead{hovered.count === 1 ? '' : 's'} · {formatDate(hovered.date)}
        </div>
      )}
    </div>
  )
}
