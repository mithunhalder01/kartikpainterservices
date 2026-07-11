import Modal from './Modal'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Delete', danger = true, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      {description && <p className="text-[13px] text-text-muted mb-5">{description}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium rounded-md text-text-muted hover:bg-surface transition-colors">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-[13px] font-medium rounded-md text-white transition-colors disabled:opacity-60
            ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:bg-accent-600'}`}>
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
