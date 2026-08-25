import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, FileText, Download, MessageCircle, Trash2, Pencil, ArrowLeft,
  Loader2, IndianRupee, Check, ListPlus, X, Save,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { computeTotals, lineAmount, rupee, amountInWords } from '../utils/money'
import { downloadQuotationPdf, whatsappText } from '../utils/quotationPdf'

const STATUSES = ['Draft', 'Sent', 'Approved', 'Rejected', 'Completed']
const UNITS = ['sq.ft', 'nos', 'ltr', 'kg', 'day', 'job']
const KINDS = [['work', 'Work'], ['material', 'Material'], ['labour', 'Labour']]

const STATUS_STYLE = {
  Draft:     'bg-surface text-text-muted border-border',
  Sent:      'bg-blue-50 text-blue-700 border-blue-200',
  Approved:  'bg-green-50 text-green-700 border-green-200',
  Rejected:  'bg-red-50 text-red-700 border-red-200',
  Completed: 'bg-violet-50 text-violet-700 border-violet-200',
}

const field = 'w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent'
const label = 'block text-[11.5px] font-medium text-text-muted mb-1'

const todayISO = () => new Date().toISOString().slice(0, 10)

const DEFAULT_TERMS = `50% advance, balance on completion.
Material as per the brand and shade agreed before starting.
Any extra work beyond this scope will be quoted separately.
Electrical fittings, furniture shifting and civil repairs are not included.`

const blankItem = () => ({ description: '', section: '', kind: 'work', unit: 'sq.ft', qty: '', rate: '' })

const BLANK = {
  quoteDate: todayISO(), validDays: 15,
  customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
  title: '', items: [blankItem()],
  discount: '', discountIsPct: false, gstPercent: 0,
  materialCost: '', otherCost: '',
  terms: DEFAULT_TERMS, notes: '', signName: '', signTitle: '',
  status: 'Draft',
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLE[status] || STATUS_STYLE.Draft}`}>
      {status}
    </span>
  )
}

/* ── Pick a saved rate instead of retyping it ── */
function RatePicker({ open, onClose, onPick }) {
  const [search, setSearch] = useState('')
  const { data } = useQuery({ queryKey: ['ratecard'], queryFn: () => api.get('/admin/quotations/ratecard') })

  const items = (data?.items || []).filter((i) =>
    !search || i.description.toLowerCase().includes(search.toLowerCase()))

  return (
    <Modal open={open} onClose={onClose} title="Add from rate card" width="max-w-md">
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className={`${field} mb-3`} />
      <div className="max-h-80 overflow-y-auto -mx-1">
        {items.length ? items.map((item, i) => (
          <button key={i} onClick={() => { onPick(item); onClose() }}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface transition-colors">
            <p className="text-[13px] font-medium text-text-primary">{item.description}</p>
            <p className="text-[12px] text-text-muted">
              {rupee(item.rate)} / {item.unit}{item.section ? ` · ${item.section}` : ''}
            </p>
          </button>
        )) : <p className="text-[13px] text-text-subtle text-center py-6">Nothing matches that search.</p>}
      </div>
      <p className="text-[11.5px] text-text-subtle mt-3 pt-3 border-t border-border">
        Rates are edited on the Rate Card button above the item list.
      </p>
    </Modal>
  )
}

/* ── Edit the saved rates ── */
function RateCardEditor({ open, onClose }) {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ['ratecard'], queryFn: () => api.get('/admin/quotations/ratecard') })
  const [rows, setRows] = useState([])

  useEffect(() => { if (open && data) setRows(data.items.map((i) => ({ ...i }))) }, [open, data])

  const mutation = useMutation({
    mutationFn: () => api.put('/admin/quotations/ratecard', {
      items: rows.filter((r) => r.description.trim()).map((r) => ({ ...r, rate: Number(r.rate) || 0 })),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratecard'] })
      toast.success('Rate card saved')
      onClose()
    },
    onError: (err) => toast.error(err.message || 'Could not save'),
  })

  const set = (i, key) => (e) => setRows((r) => r.map((row, n) => (n === i ? { ...row, [key]: e.target.value } : row)))

  return (
    <Modal open={open} onClose={onClose} title="Rate Card" width="max-w-2xl">
      <p className="text-[12.5px] text-text-muted mb-3">
        Type your prices once here. They show up as a dropdown while writing a quotation.
      </p>
      <div className="space-y-2 max-h-[55vh] overflow-y-auto">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-center">
            <input value={row.description} onChange={set(i, 'description')} placeholder="Work description"
              className={`${field} col-span-2 sm:col-span-5`} />
            <input value={row.section} onChange={set(i, 'section')} placeholder="Section"
              className={`${field} col-span-1 sm:col-span-2`} />
            <select value={row.unit} onChange={set(i, 'unit')} className={`${field} col-span-1 sm:col-span-2`}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input value={row.rate} onChange={set(i, 'rate')} placeholder="Rate" inputMode="decimal"
              className={`${field} col-span-1 sm:col-span-2`} />
            <button onClick={() => setRows((r) => r.filter((_, n) => n !== i))}
              className="col-span-1 sm:col-span-1 p-2 text-text-subtle hover:text-red-600 justify-self-end">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-2 mt-4">
        <button onClick={() => setRows((r) => [...r, { description: '', section: '', kind: 'work', unit: 'sq.ft', rate: '' }])}
          className="flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium border border-border rounded-md hover:bg-surface">
          <Plus size={14} /> Add row
        </button>
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
          className="btn-accent px-4 py-2 text-[13px] disabled:opacity-60">
          {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save Rate Card
        </button>
      </div>
    </Modal>
  )
}

/* ── The quotation editor ── */
function Editor({ existing, onDone }) {
  const [form, setForm] = useState(BLANK)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [rateCardOpen, setRateCardOpen] = useState(false)
  const [busy, setBusy] = useState('')
  const queryClient = useQueryClient()

  const { data: head } = useQuery({ queryKey: ['letterhead'], queryFn: () => api.get('/admin/letters/settings') })
  const { data: numbering } = useQuery({
    queryKey: ['quote-next'],
    queryFn: () => api.get('/admin/quotations/next-number'),
    enabled: !existing,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        ...BLANK,
        ...existing,
        items: existing.items?.length ? existing.items.map((i) => ({ ...i })) : [blankItem()],
        quoteDate: existing.quoteDate || todayISO(),
      })
    } else {
      setForm(BLANK)
    }
  }, [existing])

  // fall back to the letterhead's own signatory so the field is rarely empty
  useEffect(() => {
    if (!existing && head?.companyName && !form.signName) {
      setForm((f) => (f.signName ? f : { ...f, signName: head.companyName, signTitle: 'Proprietor' }))
    }
  }, [head, existing]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }
  const setItem = (i, key) => (e) =>
    setForm((f) => ({ ...f, items: f.items.map((item, n) => (n === i ? { ...item, [key]: e.target.value } : item)) }))

  const addItem = (preset) =>
    setForm((f) => ({ ...f, items: [...f.items, preset ? { ...blankItem(), ...preset, qty: '' } : blankItem()] }))
  const removeItem = (i) =>
    setForm((f) => ({ ...f, items: f.items.length > 1 ? f.items.filter((_, n) => n !== i) : [blankItem()] }))

  const totals = useMemo(() => computeTotals(form), [form])
  const quoteNo = existing?.quoteNo || numbering?.quoteNo || '…'

  const payload = () => ({
    ...form,
    validDays: Number(form.validDays) || 0,
    discount: Number(form.discount) || 0,
    gstPercent: Number(form.gstPercent) || 0,
    materialCost: Number(form.materialCost) || 0,
    otherCost: Number(form.otherCost) || 0,
    items: form.items
      .filter((i) => i.description.trim())
      .map((i) => ({ ...i, qty: Number(i.qty) || 0, rate: Number(i.rate) || 0 })),
  })

  const saveMutation = useMutation({
    mutationFn: () => (existing
      ? api.put(`/admin/quotations/${existing._id}`, payload())
      : api.post('/admin/quotations', payload())),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['khata'] })
      queryClient.invalidateQueries({ queryKey: ['quote-next'] })
      toast.success('Quotation saved')
      onDone(saved)
    },
    onError: (err) => toast.error(err.message || 'Could not save'),
  })

  const validate = () => {
    if (!form.customerName.trim()) { toast.error('Customer name is required'); return false }
    if (!form.items.some((i) => i.description.trim())) { toast.error('Add at least one line item'); return false }
    return true
  }

  const forPdf = () => ({ ...payload(), quoteNo })

  const downloadPdf = async () => {
    if (!validate()) return
    setBusy('pdf')
    try {
      await downloadQuotationPdf(forPdf(), head || {})
      toast.success('PDF downloaded')
    } catch (err) {
      toast.error(err?.message || 'Could not make the PDF')
    } finally { setBusy('') }
  }

  // WhatsApp cannot receive a file from a link, so the PDF is downloaded first
  // and the chat opens with the message ready — the file is attached by hand.
  const sendWhatsApp = async () => {
    if (!validate()) return
    const phone = String(form.customerPhone || '').replace(/\D/g, '')
    if (phone.length < 10) return toast.error('Add the customer phone number first')

    setBusy('wa')
    try {
      await downloadQuotationPdf(forPdf(), head || {})
      const number = phone.length === 10 ? `91${phone}` : phone
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(whatsappText(forPdf(), head || {}))}`, '_blank')
      toast.success('PDF downloaded — attach it in the WhatsApp chat that just opened')
    } catch (err) {
      toast.error(err?.message || 'Could not make the PDF')
    } finally { setBusy('') }
  }

  const profit = totals.grandTotal - totals.cost

  return (
    <div className="max-w-5xl pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <button onClick={() => onDone(null)} className="flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary">
          <ArrowLeft size={15} /> All quotations
        </button>
        <div className="flex items-center gap-2">
          <button onClick={downloadPdf} disabled={!!busy}
            className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border border-border rounded-md bg-white hover:bg-surface disabled:opacity-60">
            {busy === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={sendWhatsApp} disabled={!!busy}
            className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border border-border rounded-md bg-white hover:bg-surface disabled:opacity-60">
            {busy === 'wa' ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} className="text-green-600" />}
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button onClick={() => validate() && saveMutation.mutate()} disabled={saveMutation.isPending}
            className="btn-accent px-4 py-2 text-[13px] disabled:opacity-60">
            {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-[15px] font-bold text-text-primary">{quoteNo}</p>
          <select value={form.status} onChange={set('status')}
            className="px-3 py-1.5 text-[12.5px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Customer name <span className="text-red-500">*</span></label>
            <input value={form.customerName} onChange={set('customerName')} className={field} placeholder="Sharma ji" />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input value={form.customerPhone} onChange={set('customerPhone')} className={field} inputMode="numeric" placeholder="9876543210" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Address</label>
            <input value={form.customerAddress} onChange={set('customerAddress')} className={field} placeholder="C-42, Sector 62, Noida" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Work</label>
            <input value={form.title} onChange={set('title')} className={field} placeholder="Interior painting — 3BHK flat" />
          </div>
          <div>
            <label className={label}>Quotation date</label>
            <input type="date" value={form.quoteDate} onChange={set('quoteDate')} className={field} />
          </div>
          <div>
            <label className={label}>Valid for (days)</label>
            <input value={form.validDays} onChange={set('validDays')} className={field} inputMode="numeric" />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-[14px] font-semibold text-text-primary">Items</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setRateCardOpen(true)}
              className="text-[12.5px] font-medium text-text-muted hover:text-text-primary px-2.5 py-1.5 rounded-md hover:bg-surface">
              Rate Card
            </button>
            <button onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium border border-border rounded-md hover:bg-surface">
              <ListPlus size={14} /> From rate card
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {form.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-border p-3 bg-surface/30">
              <div className="flex items-start gap-2 mb-2">
                <input value={item.description} onChange={setItem(i, 'description')}
                  placeholder="Work description" className={`${field} bg-white`} />
                <button onClick={() => removeItem(i)} title="Remove"
                  className="p-2 text-text-subtle hover:text-red-600 shrink-0">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                <input value={item.section} onChange={setItem(i, 'section')} placeholder="Section"
                  className={`${field} bg-white`} />
                <select value={item.kind} onChange={setItem(i, 'kind')} className={`${field} bg-white`}>
                  {KINDS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
                <input value={item.qty} onChange={setItem(i, 'qty')} placeholder="Qty" inputMode="decimal"
                  className={`${field} bg-white`} />
                <select value={item.unit} onChange={setItem(i, 'unit')} className={`${field} bg-white`}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <input value={item.rate} onChange={setItem(i, 'rate')} placeholder="Rate" inputMode="decimal"
                  className={`${field} bg-white`} />
                <div className="flex items-center justify-end px-3 py-2 text-[13px] font-semibold text-text-primary">
                  {rupee(lineAmount(item))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => addItem()}
          className="flex items-center gap-1.5 mt-3 px-3 py-2 text-[12.5px] font-medium border border-border rounded-md hover:bg-surface">
          <Plus size={14} /> Add item
        </button>
      </div>

      {/* Totals */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 space-y-3">
          <p className="text-[14px] font-semibold text-text-primary">Discount & tax</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Discount</label>
              <input value={form.discount} onChange={set('discount')} className={field} inputMode="decimal" placeholder="0" />
            </div>
            <div>
              <label className={label}>Type</label>
              <select value={form.discountIsPct ? 'pct' : 'amt'}
                onChange={(e) => setForm((f) => ({ ...f, discountIsPct: e.target.value === 'pct' }))}
                className={field}>
                <option value="amt">₹ Amount</option>
                <option value="pct">% Percent</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={label}>GST</label>
              <select value={form.gstPercent} onChange={set('gstPercent')} className={field}>
                {[0, 5, 12, 18].map((g) => <option key={g} value={g}>{g === 0 ? 'No GST' : `${g}%`}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <div className="space-y-1.5 text-[13px]">
            <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span className="font-medium">{rupee(totals.subtotal)}</span></div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between"><span className="text-text-muted">Discount</span><span className="font-medium text-red-600">− {rupee(totals.discountAmount)}</span></div>
            )}
            {Number(form.gstPercent) > 0 && (
              <div className="flex justify-between"><span className="text-text-muted">GST {form.gstPercent}%</span><span className="font-medium">{rupee(totals.gstAmount)}</span></div>
            )}
          </div>
          <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-border">
            <span className="text-[13px] font-semibold text-text-primary">Total</span>
            <span className="text-[22px] font-bold text-text-primary">{rupee(totals.grandTotal)}</span>
          </div>
          <p className="text-[11.5px] text-text-subtle mt-1 italic">{amountInWords(totals.grandTotal)}</p>
        </div>
      </div>

      {/* Internal costing */}
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 mb-4">
        <p className="text-[14px] font-semibold text-text-primary">Your cost <span className="font-normal text-text-subtle text-[12px]">— never printed on the PDF</span></p>
        <p className="text-[12px] text-text-muted mt-0.5 mb-3">Fill this in to see what the job actually leaves you.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className={label}>Material cost</label>
            <input value={form.materialCost} onChange={set('materialCost')} className={field} inputMode="decimal" placeholder="0" />
          </div>
          <div>
            <label className={label}>Other cost</label>
            <input value={form.otherCost} onChange={set('otherCost')} className={field} inputMode="decimal" placeholder="0" />
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-xl bg-surface px-4 py-2.5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Profit</p>
            <p className={`text-[18px] font-bold leading-tight ${profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {rupee(profit)}
            </p>
          </div>
        </div>
        <p className="text-[11.5px] text-text-subtle mt-2">
          Labour wages are not counted here — those come from the attendance register.
        </p>
      </div>

      {/* Terms + signature */}
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 space-y-4">
        <div>
          <label className={label}>Terms & conditions — one per line</label>
          <textarea rows={5} value={form.terms} onChange={set('terms')} className={field} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={label}>Signature name</label>
            <input value={form.signName} onChange={set('signName')} className={field} />
          </div>
          <div>
            <label className={label}>Designation</label>
            <input value={form.signTitle} onChange={set('signTitle')} className={field} placeholder="Proprietor" />
          </div>
        </div>
      </div>

      <RatePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={addItem} />
      <RateCardEditor open={rateCardOpen} onClose={() => setRateCardOpen(false)} />
    </div>
  )
}

/* ── Page ── */
export default function Quotations() {
  const [editing, setEditing] = useState(undefined)   // undefined = list, null = new, object = edit
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const queryClient = useQueryClient()

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotations', { search, status }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      return api.get(`/admin/quotations?${params.toString()}`)
    },
    enabled: editing === undefined,
  })

  const { data: head } = useQuery({ queryKey: ['letterhead'], queryFn: () => api.get('/admin/letters/settings') })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/quotations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      setDeleteTarget(null)
      toast.success('Quotation deleted')
    },
    onError: (err) => toast.error(err.message || 'Delete failed'),
  })

  const stats = useMemo(() => (quotes || []).reduce((acc, q) => {
    acc.count += 1
    acc.value += q.totals.grandTotal
    if (q.status === 'Approved' || q.status === 'Completed') acc.won += q.totals.grandTotal
    if (q.status === 'Draft' || q.status === 'Sent') acc.open += q.totals.grandTotal
    return acc
  }, { count: 0, value: 0, won: 0, open: 0 }), [quotes])

  if (editing !== undefined) {
    return <Editor existing={editing} onDone={() => setEditing(undefined)} />
  }

  const downloadOne = async (quote) => {
    try {
      const full = await api.get(`/admin/quotations/${quote._id}`)
      await downloadQuotationPdf(full, head || {})
      toast.success('PDF downloaded')
    } catch (err) {
      toast.error(err?.message || 'Could not make the PDF')
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[20px] font-bold text-text-primary">Quotations</h1>
          <p className="text-[12.5px] text-text-muted mt-0.5">Make an estimate, send the PDF, and track what turns into work.</p>
        </div>
        <button onClick={() => setEditing(null)} className="btn-accent px-4 py-2 text-[13px] shrink-0">
          <Plus size={15} /> New Quotation
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Quotations', value: stats.count },
          { label: 'Total value', value: rupee(stats.value) },
          { label: 'Open', value: rupee(stats.open), tone: 'text-amber-700' },
          { label: 'Won', value: rupee(stats.won), tone: 'text-green-700' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-white px-4 py-3">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-[18px] font-bold leading-none ${s.tone || 'text-text-primary'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer, number…"
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
        ) : quotes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-surface/60 text-left">
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Number</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Customer</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Total</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Balance</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q._id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text-primary whitespace-nowrap">{q.quoteNo}</p>
                      <p className="text-[11.5px] text-text-subtle">{q.quoteDate || new Date(q.createdAt).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{q.customerName}</p>
                      <p className="text-[12px] text-text-muted truncate max-w-[220px]">{q.title || q.customerPhone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-primary whitespace-nowrap">{rupee(q.totals.grandTotal)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {q.balance > 0
                        ? <span className="font-semibold text-amber-700">{rupee(q.balance)}</span>
                        : <span className="text-text-subtle">—</span>}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={q.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(q)} title="Edit"
                          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface"><Pencil size={15} /></button>
                        <button onClick={() => downloadOne(q)} title="Download PDF"
                          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface"><Download size={15} /></button>
                        <button onClick={() => setDeleteTarget(q)} title="Delete"
                          className="p-1.5 rounded-md text-text-muted hover:text-red-700 hover:bg-red-50"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={FileText} title="No quotations yet"
            description="Make your first estimate — the PDF carries your letterhead automatically."
            action={<button onClick={() => setEditing(null)} className="btn-accent px-4 py-2 text-[13px]"><Plus size={15} /> New Quotation</button>} />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title={`Delete ${deleteTarget?.quoteNo}?`}
        description={`${deleteTarget?.customerName} — this cannot be undone.`}
      />
    </div>
  )
}

export { StatusPill, IndianRupee }
