import { useState } from 'react'

// Validated against the dataviz palette checker (light mode, categorical):
// all pass — lightness band, chroma floor, CVD separation, contrast.
const STATUS_COLORS = {
  New: '#1d4ed8',
  Contacted: '#b45309',
  Quoted: '#6d28d9',
  Won: '#15803d',
  Lost: '#b91c1c',
}
const ORDER = ['New', 'Contacted', 'Quoted', 'Won', 'Lost']

export default function StatusBarChart({ statusCounts }) {
  const [hovered, setHovered] = useState(null)
  const max = Math.max(1, ...ORDER.map((s) => statusCounts[s] || 0))

  return (
    <div className="space-y-2.5">
      {ORDER.map((status) => {
        const count = statusCounts[status] || 0
        const pct = (count / max) * 100
        const isHovered = hovered === status
        return (
          <div key={status}
            className="flex items-center gap-3 cursor-default"
            onMouseEnter={() => setHovered(status)}
            onMouseLeave={() => setHovered(null)}>
            <span className="w-20 text-[12px] text-text-muted shrink-0 text-right">{status}</span>
            <div className="flex-1 h-5 relative">
              <div
                className="h-full rounded-r-[4px] transition-opacity"
                style={{
                  width: `${Math.max(pct, count > 0 ? 3 : 0)}%`,
                  backgroundColor: STATUS_COLORS[status],
                  opacity: isHovered ? 0.85 : 1,
                }}
              />
            </div>
            <span className="w-8 text-[12.5px] font-semibold text-text-primary shrink-0">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
