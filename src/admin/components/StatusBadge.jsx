const STYLES = {
  New:       'bg-blue-50 text-blue-700 border-blue-200',
  Contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  Quoted:    'bg-violet-50 text-violet-700 border-violet-200',
  Won:       'bg-green-50 text-green-700 border-green-200',
  Lost:      'bg-red-50 text-red-700 border-red-200',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status] || STYLES.New}`}>
      {status}
    </span>
  )
}
