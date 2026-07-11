import { Star } from 'lucide-react'

export default function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
          <Star size={20} className={n <= value ? 'fill-accent text-accent' : 'text-border'} />
        </button>
      ))}
    </div>
  )
}
