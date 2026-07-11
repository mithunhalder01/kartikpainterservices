export function SkeletonRow({ cols = 4 }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-3.5 bg-surface rounded animate-pulse flex-1" />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="aspect-[4/3] bg-surface animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-surface rounded animate-pulse w-2/3" />
        <div className="h-3 bg-surface rounded animate-pulse w-1/3" />
      </div>
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="rounded-xl border border-border p-4 space-y-2">
      <div className="h-3 bg-surface rounded animate-pulse w-1/2" />
      <div className="h-7 bg-surface rounded animate-pulse w-1/3" />
    </div>
  )
}
