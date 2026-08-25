import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Pencil, Trash2, Ban, CheckCircle2, PauseCircle,
  KeyRound, Phone, HardHat, IndianRupee, Users, HandCoins,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import LabourPayments from './LabourPayments'

const STATUS_META = {
  active:   { label: 'Active',   cls: 'bg-green-50 text-green-700 border-green-200' },
  inactive: { label: 'Inactive', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  blocked:  { label: 'Blocked',  cls: 'bg-red-50 text-red-700 border-red-200' },
}

const field = 'w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent'
const label = 'block text-[12px] font-medium text-text-muted mb-1.5'

const todayISO = () => new Date().toISOString().slice(0, 10)

const EMPTY = {
  name: '', phone: '', altPhone: '', designation: 'Painter', dailyWage: '', overtimeRate: '',
  joinedOn: todayISO(), address: '', idProof: '', notes: '',
  status: 'active', canLogin: false, password: '',
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.active
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${meta.cls}`}>
      {meta.label}
    </span>
  )
}

function LabourForm({ open, onClose, editing }) {
  const isEdit = !!editing
  const [form, setForm] = useState(EMPTY)
  const [touched, setTouched] = useState(false)
  const queryClient = useQueryClient()

  // every time the modal opens, load that record (or a blank form for a new one)
  useEffect(() => {
    if (!open) return
    setTouched(false)
    setForm(editing
      ? {
          ...EMPTY,
          ...editing,
          dailyWage: editing.dailyWage ?? '',
          overtimeRate: editing.overtimeRate ?? '',
          joinedOn: editing.joinedOn ? editing.joinedOn.slice(0, 10) : todayISO(),
          password: '',
        }
      : EMPTY)
  }, [open, editing])

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [k]: value }))
  }

  const mutation = useMutation({
    mutationFn: (payload) => (isEdit
      ? api.patch(`/admin/labour/${editing._id}`, payload)
      : api.post('/admin/labour', payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour'] })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success(isEdit ? 'Labour updated' : 'Labour added')
      onClose()
    },
    onError: (err) => toast.error(err.message || 'Could not save'),
  })

  const phoneDigits = form.phone.replace(/\D/g, '')
  const nameOk = form.name.trim().length > 0
  const phoneOk = phoneDigits.length >= 10
  const passwordOk = !form.password || form.password.length >= 6
  // a brand-new labour needs a password before login can be switched on
  const loginOk = !form.canLogin || isEdit || !!form.password
  const canSave = nameOk && phoneOk && passwordOk && loginOk

  const submit = () => {
    setTouched(true)
    if (!canSave) return
    const payload = {
      name: form.name.trim(),
      phone: phoneDigits,
      altPhone: form.altPhone.replace(/\D/g, ''),
      designation: form.designation.trim(),
      dailyWage: Number(form.dailyWage) || 0,
      overtimeRate: Number(form.overtimeRate) || 0,
      joinedOn: form.joinedOn,
      address: form.address.trim(),
      idProof: form.idProof.trim(),
      notes: form.notes.trim(),
      status: form.status,
      canLogin: !!form.canLogin,
    }
    if (form.password) payload.password = form.password
    mutation.mutate(payload)
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Edit — ${editing.name}` : 'Add Labour'} width="max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Name <span className="text-red-500">*</span></label>
          <input value={form.name} onChange={set('name')} className={field} placeholder="Ramesh Kumar" autoFocus />
          {touched && !nameOk && <p className="text-[11.5px] text-red-600 mt-1">Name is required</p>}
        </div>
        <div>
          <label className={label}>Phone (login ID) <span className="text-red-500">*</span></label>
          <input value={form.phone} onChange={set('phone')} className={field} placeholder="9876543210" inputMode="numeric" />
          {touched && !phoneOk && <p className="text-[11.5px] text-red-600 mt-1">Enter a 10-digit phone number</p>}
        </div>
        <div>
          <label className={label}>Work / Designation</label>
          <input value={form.designation} onChange={set('designation')} className={field} placeholder="Painter, Helper, Mistri…" />
        </div>
        <div>
          <label className={label}>Daily wage (₹)</label>
          <input value={form.dailyWage} onChange={set('dailyWage')} className={field} placeholder="700" inputMode="numeric" />
        </div>
        <div>
          <label className={label}>Overtime rate (₹ per hour)</label>
          <input value={form.overtimeRate} onChange={set('overtimeRate')} className={field} placeholder="0" inputMode="numeric" />
          <p className="text-[11px] text-text-subtle mt-1">Leave 0 if overtime is not paid separately.</p>
        </div>
        <div>
          <label className={label}>Joined on</label>
          <input type="date" value={form.joinedOn} onChange={set('joinedOn')} className={field} />
        </div>
        <div>
          <label className={label}>Alternate phone</label>
          <input value={form.altPhone} onChange={set('altPhone')} className={field} inputMode="numeric" />
        </div>
        <div>
          <label className={label}>ID proof no. (Aadhaar / other)</label>
          <input value={form.idProof} onChange={set('idProof')} className={field} />
        </div>
        <div>
          <label className={label}>Status</label>
          <select value={form.status} onChange={set('status')} className={field}>
            <option value="active">Active — currently working</option>
            <option value="inactive">Inactive — not working now</option>
            <option value="blocked">Blocked — no login allowed</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Address</label>
          <input value={form.address} onChange={set('address')} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Notes</label>
          <textarea rows={2} value={form.notes} onChange={set('notes')} className={field} />
        </div>

        <div className="sm:col-span-2 rounded-xl border border-border bg-surface/60 p-4">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={!!form.canLogin} onChange={set('canLogin')} className="mt-0.5 accent-[#E07A3A] w-4 h-4" />
            <span>
              <span className="block text-[13px] font-medium text-text-primary">Allow this labour to log in</span>
              <span className="block text-[12px] text-text-muted">
                They sign in with their phone number and can only <b>view</b> their own attendance — never edit it.
              </span>
            </span>
          </label>

          {form.canLogin && (
            <div className="mt-3">
              <label className={label}>{isEdit ? 'New password (leave blank to keep current)' : 'Password'}</label>
              <input type="text" value={form.password} onChange={set('password')} className={field} placeholder="At least 6 characters" />
              {touched && !passwordOk && <p className="text-[11.5px] text-red-600 mt-1">Password must be at least 6 characters</p>}
              {touched && !loginOk && <p className="text-[11.5px] text-red-600 mt-1">Set a password to enable login</p>}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium rounded-md text-text-muted hover:bg-surface transition-colors">
          Cancel
        </button>
        <button onClick={submit} disabled={mutation.isPending}
          className="btn-accent px-5 py-2 text-[13px] disabled:opacity-60">
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Labour'}
        </button>
      </div>
    </Modal>
  )
}

export default function LabourPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['labour', { search, status }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      return api.get(`/admin/labour?${params.toString()}`)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status: next }) => api.patch(`/admin/labour/${id}/status`, { status: next }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['labour'] })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success(`Marked ${STATUS_META[vars.status].label.toLowerCase()}`)
    },
    onError: (err) => toast.error(err.message || 'Could not update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/labour/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['labour'] })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      setDeleteTarget(null)
      toast.success(res?.attendanceRemoved
        ? `Deleted along with ${res.attendanceRemoved} attendance records`
        : 'Labour deleted')
    },
    onError: (err) => toast.error(err.message || 'Delete failed'),
  })

  const counts = data?.counts || { active: 0, inactive: 0, blocked: 0 }
  const totalWage = useMemo(
    () => (data?.labours || []).filter((l) => l.status === 'active')
      .reduce((sum, l) => sum + (l.dailyWage || 0), 0),
    [data],
  )

  const [tab, setTab] = useState('crew')

  const openAdd = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (labour) => { setEditing(labour); setFormOpen(true) }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[20px] font-bold text-text-primary">Labour</h1>
          <p className="text-[12.5px] text-text-muted mt-0.5">Your crew — add workers, control their access, and keep records.</p>
        </div>
        {tab === 'crew' && (
          <button onClick={openAdd} className="btn-accent px-4 py-2 text-[13px] shrink-0">
            <Plus size={15} /> Add Labour
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 mb-4 p-1 bg-surface rounded-xl w-full sm:w-fit">
        {[
          { key: 'crew', label: 'Crew', icon: Users },
          { key: 'pay', label: 'Payments', icon: HandCoins },
        ].map(({ key, label: text, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg transition-colors
              ${tab === key ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
            <Icon size={15} /> {text}
          </button>
        ))}
      </div>

      {tab === 'pay' ? <LabourPayments /> : (
      <>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Active', value: counts.active, icon: HardHat, tone: 'text-green-700' },
          { label: 'Inactive', value: counts.inactive, icon: PauseCircle, tone: 'text-amber-700' },
          { label: 'Blocked', value: counts.blocked, icon: Ban, tone: 'text-red-700' },
          { label: 'Wage / day', value: `₹${totalWage.toLocaleString('en-IN')}`, icon: IndianRupee, tone: 'text-text-primary' },
        ].map(({ label: l, value, icon: Icon, tone }) => (
          <div key={l} className="rounded-xl border border-border bg-white px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={13} className="text-text-subtle" />
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{l}</p>
            </div>
            <p className={`text-[19px] font-bold leading-none ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, work…"
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
        ) : data?.labours?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-surface/60 text-left">
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Name</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Work</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Daily wage</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Login</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.labours.map((l) => (
                  <tr key={l._id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text-primary">{l.name}</p>
                      <p className="text-[12px] text-text-muted flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {l.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{l.designation || '—'}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {l.dailyWage ? `₹${l.dailyWage.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {l.canLogin
                        ? <span className="inline-flex items-center gap-1 text-[12px] text-green-700"><KeyRound size={12} /> Enabled</span>
                        : <span className="text-[12px] text-text-subtle">Off</span>}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={l.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(l)} title="Edit"
                          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors">
                          <Pencil size={15} />
                        </button>
                        {l.status === 'active' ? (
                          <button onClick={() => statusMutation.mutate({ id: l._id, status: 'inactive' })} title="Mark inactive"
                            className="p-1.5 rounded-md text-text-muted hover:text-amber-700 hover:bg-amber-50 transition-colors">
                            <PauseCircle size={15} />
                          </button>
                        ) : (
                          <button onClick={() => statusMutation.mutate({ id: l._id, status: 'active' })} title="Mark active"
                            className="p-1.5 rounded-md text-text-muted hover:text-green-700 hover:bg-green-50 transition-colors">
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        {l.status !== 'blocked' && (
                          <button onClick={() => statusMutation.mutate({ id: l._id, status: 'blocked' })} title="Block login"
                            className="p-1.5 rounded-md text-text-muted hover:text-red-700 hover:bg-red-50 transition-colors">
                            <Ban size={15} />
                          </button>
                        )}
                        <button onClick={() => setDeleteTarget(l)} title="Delete"
                          className="p-1.5 rounded-md text-text-muted hover:text-red-700 hover:bg-red-50 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={HardHat}
            title="No labour added yet"
            description="Add your workers here — then you can mark their attendance every day."
            action={<button onClick={openAdd} className="btn-accent px-4 py-2 text-[13px]"><Plus size={15} /> Add Labour</button>}
          />
        )}
      </div>

      </>
      )}

      <LabourForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title={`Delete ${deleteTarget?.name}?`}
        description="This also deletes all of their attendance records permanently. If they have just stopped working, use “Mark inactive” instead."
      />
    </div>
  )
}
