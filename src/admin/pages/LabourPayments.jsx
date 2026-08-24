import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Loader2, Check, FileDown, Trash2, Info, HandCoins,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { rupee } from '../utils/money'
import { downloadWageSlip } from '../utils/wageSlipPdf'

const TYPES = [
  ['advance', 'Advance given'],
  ['payment', 'Payment / settlement'],
  ['bonus', 'Bonus (adds to what you owe)'],
  ['deduction', 'Deduction'],
]
const MODES = ['Cash', 'UPI', 'Bank', 'Cheque', 'Other']

const field = 'w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent'
const label = 'block text-[11.5px] font-medium text-text-muted mb-1'

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const monthValue = (y, m) => `${y}-${String(m).padStart(2, '0')}`

function EntryModal({ target, labours, onClose }) {
  const [form, setForm] = useState({
    labour: target?.labour?._id || '',
    date: todayISO(),
    amount: '',
    type: target?.type || 'advance',
    mode: 'Cash',
    note: '',
  })
  const queryClient = useQueryClient()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const mutation = useMutation({
    mutationFn: () => api.post('/admin/labour-payments/entries', { ...form, amount: Number(form.amount) || 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-ledger'] })
      toast.success('Entry saved')
      onClose()
    },
    onError: (err) => toast.error(err.message || 'Could not save'),
  })

  const submit = () => {
    if (!form.labour) return toast.error('Choose the worker')
    if ((Number(form.amount) || 0) < 1) return toast.error('Enter the amount')
    mutation.mutate()
  }

  const selected = labours.find((l) => l._id === form.labour)

  return (
    <Modal open onClose={onClose} title="Advance / Payment" width="max-w-sm">
      <div className="space-y-3.5">
        <div>
          <label className={label}>Worker</label>
          <select value={form.labour} onChange={set('labour')} className={field}>
            <option value="">Choose…</option>
            {labours.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>What is this?</label>
          <select value={form.type} onChange={set('type')} className={field}>
            {TYPES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Date</label>
            <input type="date" value={form.date} onChange={set('date')} className={field} />
          </div>
          <div>
            <label className={label}>Amount</label>
            <input value={form.amount} onChange={set('amount')} className={field} inputMode="decimal" placeholder="0" />
          </div>
        </div>
        {selected && (
          <div className="flex flex-wrap gap-1.5">
            {[500, 1000, 2000, 5000].map((v) => (
              <button key={v} onClick={() => setForm((f) => ({ ...f, amount: String(v) }))}
                className="px-2.5 py-1 text-[12px] font-medium border border-border rounded-md hover:bg-surface">
                {rupee(v)}
              </button>
            ))}
          </div>
        )}
        <div>
          <label className={label}>Mode</label>
          <select value={form.mode} onChange={set('mode')} className={field}>
            {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Note — optional</label>
          <input value={form.note} onChange={set('note')} className={field} placeholder="Ghar ke liye advance" />
        </div>
        <button onClick={submit} disabled={mutation.isPending}
          className="w-full btn-accent justify-center py-2.5 text-[13px] disabled:opacity-60">
          {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save Entry
        </button>
      </div>
    </Modal>
  )
}

export default function LabourPayments() {
  const now = new Date()
  const [ym, setYm] = useState(monthValue(now.getFullYear(), now.getMonth() + 1))
  const [entryFor, setEntryFor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [slipBusy, setSlipBusy] = useState('')
  const [year, month] = ym.split('-').map(Number)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['labour-ledger', year, month],
    queryFn: () => api.get(`/admin/labour-payments/ledger?year=${year}&month=${month}`),
    enabled: !!year && !!month,
  })
  const { data: head } = useQuery({ queryKey: ['letterhead'], queryFn: () => api.get('/admin/letters/settings') })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/labour-payments/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-ledger'] })
      setDeleteTarget(null)
      toast.success('Entry removed')
    },
    onError: (err) => toast.error(err.message || 'Could not remove'),
  })

  const labours = data?.labours || []
  const rows = data?.rows || {}
  const entries = data?.entries || []
  const summary = data?.summary || { earned: 0, settled: 0, balance: 0 }

  const slip = async (labour) => {
    setSlipBusy(labour._id)
    try {
      await downloadWageSlip({
        labour,
        row: rows[labour._id],
        entries: entries.filter((e) => String(e.labour) === String(labour._id)),
        year, month,
      }, head || {})
      toast.success('Wage slip downloaded')
    } catch (err) {
      toast.error(err?.message || 'Could not make the slip')
    } finally { setSlipBusy('') }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <input type="month" value={ym} onChange={(e) => e.target.value && setYm(e.target.value)}
          className="px-3 py-2 text-[13px] border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
        <button onClick={() => setEntryFor({})} className="btn-accent px-4 py-2 text-[13px]">
          <Plus size={15} /> Advance / Payment
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Earned', value: summary.earned },
          { label: 'Paid out', value: summary.settled, tone: 'text-green-700' },
          { label: 'Still owed', value: summary.balance, tone: summary.balance > 0 ? 'text-amber-700' : 'text-text-primary' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-white px-4 py-3">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-[18px] font-bold leading-none ${s.tone || 'text-text-primary'}`}>{rupee(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">
        <Info size={15} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[12.5px] text-blue-800">
          Wages come straight from the attendance register at each worker's current daily rate —
          so changing someone's rate also re-values their earlier months.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden mb-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
        ) : labours.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-surface/60 text-left">
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Worker</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Days</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Earned</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Advance</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Paid</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Baaki</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {labours.map((l) => {
                  const r = rows[l._id] || {}
                  return (
                    <tr key={l._id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text-primary">{l.name}</p>
                        <p className="text-[11.5px] text-text-subtle">
                          {l.designation || 'Worker'}{l.dailyWage ? ` · ${rupee(l.dailyWage)}/day` : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-text-primary">{r.payableDays || 0}</span>
                        <span className="text-[11.5px] text-text-subtle"> ({r.P || 0}P {r.H || 0}H {r.A || 0}A)</span>
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{rupee(r.earned)}</td>
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">{r.advance ? rupee(r.advance) : '—'}</td>
                      <td className="px-4 py-3 text-green-700 whitespace-nowrap">{r.payment ? rupee(r.payment) : '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-bold ${r.balance > 0 ? 'text-amber-700' : r.balance < 0 ? 'text-red-600' : 'text-text-subtle'}`}>
                          {rupee(r.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => slip(l)} disabled={slipBusy === l._id} title="Wage slip PDF"
                            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface disabled:opacity-50">
                            {slipBusy === l._id ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
                          </button>
                          <button onClick={() => setEntryFor({ labour: l, type: 'payment' })}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold text-accent bg-accent/10 rounded-md hover:bg-accent/20 whitespace-nowrap">
                            <Plus size={13} /> Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={HandCoins} title="No workers yet"
            description="Add workers on the Crew tab, mark their attendance, and their wages show up here." />
        )}
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <p className="px-4 py-3 text-[13px] font-semibold text-text-primary border-b border-border">
          Entries this month
        </p>
        {entries.length ? entries.map((e) => {
          const worker = labours.find((l) => String(l._id) === String(e.labour))
          return (
            <div key={e._id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-text-primary truncate">
                  {worker?.name || 'Worker'} — <span className="capitalize">{e.type}</span>
                </p>
                <p className="text-[11.5px] text-text-muted">
                  {new Date(e.date).toLocaleDateString('en-IN')} · {e.mode}{e.note ? ` · ${e.note}` : ''}
                </p>
              </div>
              <p className={`text-[13.5px] font-semibold shrink-0 ${e.type === 'bonus' ? 'text-green-700' : 'text-text-primary'}`}>
                {rupee(e.amount)}
              </p>
              <button onClick={() => setDeleteTarget(e)} className="p-1.5 text-text-subtle hover:text-red-600 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          )
        }) : (
          <p className="px-4 py-6 text-[13px] text-text-subtle text-center">No advances or payments recorded this month.</p>
        )}
      </div>

      {entryFor && <EntryModal target={entryFor} labours={labours} onClose={() => setEntryFor(null)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Remove this entry?"
        description={`${rupee(deleteTarget?.amount || 0)} will go back into what is still owed.`}
      />
    </>
  )
}
