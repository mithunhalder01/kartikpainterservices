export default function EditorField({ label, ...props }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-text-muted mb-1.5">{label}</label>
      <input {...props}
        className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
    </div>
  )
}
