import { useState } from 'react'

export default function TagList({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    if (!draft.trim()) return
    onChange([...items, draft.trim()])
    setDraft('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[12.5px] bg-surface border border-border px-3 py-1.5 rounded-full">
            {item}
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-text-subtle hover:text-red-600">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
        <button onClick={add} className="px-3 py-2 text-[13px] font-medium bg-dark text-white rounded-md">Add</button>
      </div>
    </div>
  )
}
