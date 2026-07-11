export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-3">
          <Icon size={20} className="text-text-muted" />
        </div>
      )}
      <p className="text-[14px] font-semibold text-text-primary">{title}</p>
      {description && <p className="text-[13px] text-text-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
