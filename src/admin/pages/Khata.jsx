import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Wallet, Plus, Phone, Trash2, Loader2, Check, AlertTriangle, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { rupee } from '../utils/money'

const MODES = ['Cash', 'UPI', 'Bank', 'Cheque', 'Other']
const field = 'w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent'
const label = 'block text-[11.5px] font-medium text-text-muted mb-1'

const todayISO = () => new Date().toISOString().slice(0, 10)

/* Old money is the money that needs a phone call. */
function AgeBadge({ days, balance }) {
  if (balance <= 0) return <span className="text-[11.5px] text-text-subtle">Settled</span>
  const tone = days > 60 ? 'text-red-700 bg-red-50 border-red-200'
    : days > 30 ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-text-muted bg-surface border-border'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${tone}`}>
      {days} {days === 1 ? 'day' : 'days'}
    </span>
  )
}

function AddPaymentModal({ job, onClose }) {
  const [form, setForm] = useState({ date: todayISO(), amount: '', mode: 'Cash', reference: '', note: '' })
  const queryClient = useQueryClient()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const mutation = useMutation({
    mutationFn: () => api.post('/admin/payments', {
      quotation: job._id,
      date: form.date,
      amount: Number(form.amount) || 0,
      mode: form.mode,
      reference: form.reference,
      note: form.note,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['khata'] })
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['job-payments'] })
      toast.success('Payment recorded')
      onClose()
    },
    onError: (err) => toast.error(err.message || 'Could not save'),
  })

  const amount = Number(form.amount) || 0
  const submit = () => {
    if (amount < 1) return toast.error('Enter the amount received')
    if (amount > job.balance) {
      // over-payment is usually a typo, but advances for extra work do happen
      if (!window.confirm(`This is more than the ${rupee(job.balance)} still due. Record it anyway?`)) return
    }
    mutation.mutate()
  }

  return (
    <Modal open={!!job} onClose={onClose} title="Record payment" width="max-w-sm">
      <div className="rounded-xl bg-surface px-4 py-3 mb-4">
        <p className="text-[13px] font-semibold text-text-primary">{job.customerName}</p>
        <p className="text-[12px] text-text-muted">{job.quoteNo}{job.title ? ` · ${job.title}` : ''}</p>
        <p className="text-[12.5px] mt-1.5">
          <span className="text-text-muted">Still due </span>
          <b className="text-amber-700">{rupee(job.balance)}</b>
          <span className="text-text-subtle"> of {rupee(job.total)}</span>
        </p>
      </div>

      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Date</label>
            <input type="date" value={form.date} max={todayISO()} onChange={set('date')} className={field} />
          </div>
          <div>
            <label className={label}>Amount received</label>
            <input value={form.amount} onChange={set('amount')} className={field} inputMode="decimal" placeholder="0" autoFocus />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[job.balance, Math.round(job.balance / 2), 10000, 5000]
            .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)
            .map((v) => (
              <button key={v} onClick={() => setForm((f) => ({ ...f, amount: String(v) }))}
                className="px-2.5 py-1 text-[12px] font-medium border border-border rounded-md hover:bg-surface">
                {rupee(v)}
              </button>
            ))}
        </div>
        <div>
          <label className={label}>Mode</label>
          <select value={form.mode} onChange={set('mode')} className={field}>
            {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Reference (UPI / cheque no.) — optional</label>
          <input value={form.reference} onChange={set('reference')} className={field} />
        </div>
        <div>
          <label className={label}>Note — optional</label>
          <input value={form.note} onChange={set('note')} className={field} />
        </div>
        <button onClick={submit} disabled={mutation.isPending}
          className="w-full btn-accent justify-center py-2.5 text-[13px] disabled:opacity-60">
          {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save Payment
        </button>
      </div>
    </Modal>
  )
}

function HistoryDrawer({ job, onClose }) {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: payments, isLoading } = useQuery({
    queryKey: ['job-payments', job._id],
    queryFn: () => api.get(`/admin/payments?quotation=${job._id}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['khata'] })
      queryClient.invalidateQueries({ queryKey: ['job-payments'] })
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      setDeleteTarget(null)
      toast.success('Payment entry removed')
    },
    onError: (err) => toast.error(err.message || 'Could not remove'),
  })

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-text-primary truncate">{job.customerName}</h3>
            <p className="text-[12px] text-text-muted">{job.quoteNo}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:bg-surface rounded-md"><X size={18} /></button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total', value: job.total },
              { label: 'Received', value: job.received, tone: 'text-green-700' },
              { label: 'Due', value: job.balance, tone: 'text-amber-700' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-surface px-3 py-2.5">
                <p className="text-[10.5px] font-semibold text-text-muted uppercase tracking-wide">{s.label}</p>
                <p className={`text-[15px] font-bold ${s.tone || 'text-text-primary'}`}>{rupee(s.value)}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Payments</p>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={3} />)
          ) : payments?.length ? (
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p._id} className="flex items-start gap-3 rounded-xl border border-border px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-text-primary">{rupee(p.amount)}</p>
                    <p className="text-[12px] text-text-muted">
                      {new Date(p.date).toLocaleDateString('en-IN')} · {p.mode}
                      {p.reference ? ` · ${p.reference}` : ''}
                    </p>
                    {p.note && <p className="text-[12px] text-text-subtle mt-0.5">{p.note}</p>}
                  </div>
                  <button onClick={() => setDeleteTarget(p)}
                    className="p-1.5 text-text-subtle hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-text-subtle py-4">Nothing received yet.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Remove this payment entry?"
        description={`${rupee(deleteTarget?.amount || 0)} will be added back to the pending amount.`}
      />
    </div>
  )
}

export default function Khata() {
  const [search, setSearch] = useState('')
  const [show, setShow] = useState('pending')
  const [payFor, setPayFor] = useState(null)
  const [historyFor, setHistoryFor] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['khata', { search, show }],
    queryFn: () => {
      const params = new URLSearchParams({ show })
      if (search) params.set('search', search)
      return api.get(`/admin/payments/ledger?${params.toString()}`)
    },
  })

  const summary = data?.summary || { total: 0, received: 0, balance: 0, pendingJobs: 0, overdue: 0 }
  const ledger = data?.ledger || []

  return (
    <div className="max-w-6xl">
      <div className="mb-5">
        <h1 className="text-[20px] font-bold text-text-primary">Khata</h1>
        <p className="text-[12.5px] text-text-muted mt-0.5">Kisse kitna lena baaki hai — one place, always current.</p>
      </div>

      {/* the number that matters most */}
      <div className="rounded-2xl border border-border bg-white p-5 mb-4">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Paisa bahar hai</p>
        <p className="text-[34px] sm:text-[40px] font-bold text-text-primary leading-none">{rupee(summary.balance)}</p>
        <p className="text-[12.5px] text-text-muted mt-2">
          across <b className="text-text-primary">{summary.pendingJobs}</b> {summary.pendingJobs === 1 ? 'job' : 'jobs'}
          {summary.overdue > 0 && (
            <span className="inline-flex items-center gap-1 ml-2 text-red-700 font-medium">
              <AlertTriangle size={12} /> {rupee(summary.overdue)} pending over 30 days
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total billed', value: summary.total },
          { label: 'Received', value: summary.received, tone: 'text-green-700' },
          { label: 'Pending', value: summary.balance, tone: 'text-amber-700' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-white px-4 py-3">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-[18px] font-bold leading-none ${s.tone || 'text-text-primary'}`}>{rupee(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer, number…"
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        <select value={show} onChange={(e) => setShow(e.target.value)}
          className="px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option value="pending">Pending only</option>
          <option value="settled">Fully paid</option>
          <option value="all">All jobs</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
        ) : ledger.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[760px]">
              <thead>
                <tr className="border-b border-border bg-surface/60 text-left">
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Customer</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Total</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Received</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Baaki</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Waiting</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row) => (
                  <tr key={row._id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => setHistoryFor(row)} className="text-left">
                        <p className="font-semibold text-text-primary hover:text-accent transition-colors">{row.customerName}</p>
                        <p className="text-[11.5px] text-text-subtle">{row.quoteNo}{row.title ? ` · ${row.title}` : ''}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{rupee(row.total)}</td>
                    <td className="px-4 py-3 text-green-700 whitespace-nowrap">{rupee(row.received)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.balance > 0
                        ? <span className="font-bold text-amber-700">{rupee(row.balance)}</span>
                        : <span className="inline-flex items-center gap-1 text-green-700 font-medium"><Check size={13} /> Paid</span>}
                    </td>
                    <td className="px-4 py-3"><AgeBadge days={row.ageDays} balance={row.balance} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {row.customerPhone && (
                          <a href={`tel:${row.customerPhone}`} title="Call"
                            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface"><Phone size={15} /></a>
                        )}
                        {row.balance > 0 && (
                          <button onClick={() => setPayFor(row)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold text-accent bg-accent/10 rounded-md hover:bg-accent/20 transition-colors whitespace-nowrap">
                            <Plus size={13} /> Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Wallet} title="Nothing pending"
            description="Jobs show up here once a quotation is marked Approved." />
        )}
      </div>

      {payFor && <AddPaymentModal job={payFor} onClose={() => setPayFor(null)} />}
      {historyFor && <HistoryDrawer job={historyFor} onClose={() => setHistoryFor(null)} />}
    </div>
  )
}
