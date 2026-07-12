export default function EditorSection({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="text-[14px] font-semibold text-text-primary mb-4">{title}</h2>
      {children}
    </div>
  )
}
