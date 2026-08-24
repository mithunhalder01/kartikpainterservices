import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarCheck, CalendarDays, Download, FileSpreadsheet, FileText, ChevronLeft,
  ChevronRight, Check, Users, Loader2, Eraser, HardHat,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import EmptyState from '../components/EmptyState'
import { SkeletonRow } from '../components/Skeleton'
import { exportAttendanceExcel, exportAttendancePdf, isoFor, isSunday, monthName } from '../utils/attendanceExport'

const STATUS_ORDER = ['P', 'H', 'A']
const CYCLE = { '': 'P', P: 'H', H: 'A', A: '' }

const STATUS_STYLE = {
  P: 'bg-green-100 text-green-800 border-green-300',
  H: 'bg-amber-100 text-amber-800 border-amber-300',
  A: 'bg-red-100 text-red-700 border-red-300',
  '': 'bg-white text-text-subtle border-border',
}

const STATUS_NAME = { P: 'Present', H: 'Half Day', A: 'Absent' }

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const monthValue = (y, m) => `${y}-${String(m).padStart(2, '0')}`
const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

/* ── Export menu ── */
function ExportMenu({ data, disabled }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const run = async (kind) => {
    if (!data?.labours?.length) return toast.error('Nothing to export for this month')
    setBusy(kind)
    try {
      if (kind === 'pdf') await exportAttendancePdf(data)
      else await exportAttendanceExcel(data)
      toast.success(kind === 'pdf' ? 'PDF downloaded' : 'Excel downloaded')
      setOpen(false)
    } catch (err) {
      toast.error(err?.message || 'Export failed')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} disabled={disabled}
        className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium border border-border rounded-md
                   bg-white text-text-primary hover:bg-surface transition-colors disabled:opacity-50">
        <Download size={15} /> Export
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-xl z-40 overflow-hidden">
          <p className="px-4 pt-3 pb-1 text-[10.5px] font-semibold text-text-subtle uppercase tracking-wider">
            {monthName(data?.month)} {data?.year}
          </p>
          <button onClick={() => run('pdf')} disabled={!!busy}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-text-primary hover:bg-surface transition-colors">
            {busy === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} className="text-red-600" />}
            Download PDF
          </button>
          <button onClick={() => run('excel')} disabled={!!busy}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-text-primary hover:bg-surface transition-colors">
            {busy === 'excel' ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} className="text-green-700" />}
            Download Excel
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Tab 1: mark one day ── */
function MarkDay({ onSaved }) {
  const [date, setDate] = useState(todayISO())
  const [draft, setDraft] = useState({})
  const [detailFor, setDetailFor] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'day', date],
    queryFn: () => api.get(`/admin/attendance/day?date=${date}`),
  })

  useEffect(() => {
    if (!data) return
    const next = {}
    data.labours.forEach((l) => {
      const m = data.marks[l._id]
      next[l._id] = m
        ? { status: m.status, overtimeHours: m.overtimeHours || 0, site: m.site || '', note: m.note || '' }
        : { status: '', overtimeHours: 0, site: '', note: '' }
    })
    setDraft(next)
  }, [data])

  // saving both writes the ticked rows and clears any row the admin un-ticked
  const saveMutation = useMutation({
    mutationFn: async ({ entries, removals }) => {
      await Promise.all(removals.map((id) => api.delete(`/admin/attendance/one?labour=${id}&date=${date}`)))
      if (!entries.length) return { saved: 0, cleared: removals.length }
      const res = await api.post('/admin/attendance/mark', { date, entries })
      return { ...res, cleared: removals.length }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      const bits = []
      if (res.saved) bits.push(`${res.saved} saved`)
      if (res.cleared) bits.push(`${res.cleared} cleared`)
      toast.success(`Attendance updated — ${bits.join(', ')}`)
      onSaved?.()
    },
    onError: (err) => toast.error(err.message || 'Could not save attendance'),
  })

  const labours = data?.labours || []
  const marked = labours.filter((l) => draft[l._id]?.status).length
  const working = labours.filter((l) => draft[l._id]?.status === 'P' || draft[l._id]?.status === 'H').length
  const removals = labours
    .filter((l) => data?.marks?.[l._id] && !draft[l._id]?.status)
    .map((l) => l._id)
  const dirty = marked > 0 || removals.length > 0

  const setStatus = (id, status) =>
    setDraft((d) => ({ ...d, [id]: { ...(d[id] || { overtimeHours: 0, site: '', note: '' }), status } }))

  const setField = (id, key, value) =>
    setDraft((d) => ({ ...d, [id]: { ...(d[id] || { status: '' }), [key]: value } }))

  const bulk = (status) => {
    setDraft((d) => {
      const next = { ...d }
      labours.forEach((l) => { next[l._id] = { ...(next[l._id] || { overtimeHours: 0, site: '', note: '' }), status } })
      return next
    })
  }

  const save = () => {
    const entries = labours
      .filter((l) => draft[l._id]?.status)
      .map((l) => ({
        labour: l._id,
        status: draft[l._id].status,
        overtimeHours: Number(draft[l._id].overtimeHours) || 0,
        site: draft[l._id].site || '',
        note: draft[l._id].note || '',
      }))
    if (!entries.length && !removals.length) return toast.error('Tick at least one person first')
    saveMutation.mutate({ entries, removals })
  }

  const isToday = date === todayISO()
  const shiftDay = (delta) => {
    const d = new Date(`${date}T00:00:00`)
    d.setDate(d.getDate() + delta)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (iso <= todayISO()) setDate(iso)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center border border-border rounded-md bg-white overflow-hidden">
          <button onClick={() => shiftDay(-1)} className="px-2 py-2 text-text-muted hover:bg-surface transition-colors">
            <ChevronLeft size={16} />
          </button>
          <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)}
            className="px-2 py-2 text-[13px] focus:outline-none" />
          <button onClick={() => shiftDay(1)} disabled={isToday}
            className="px-2 py-2 text-text-muted hover:bg-surface transition-colors disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
        {!isToday && (
          <button onClick={() => setDate(todayISO())}
            className="px-3 py-2 text-[12.5px] font-medium text-accent hover:bg-accent/10 rounded-md transition-colors">
            Jump to today
          </button>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <span className="text-[12.5px] text-text-muted">Mark everyone:</span>
          {STATUS_ORDER.map((s) => (
            <button key={s} onClick={() => bulk(s)}
              className={`px-2.5 py-1.5 text-[12px] font-semibold rounded-md border transition-colors ${STATUS_STYLE[s]} hover:brightness-95`}>
              {s}
            </button>
          ))}
          <button onClick={() => bulk('')} title="Clear all"
            className="px-2.5 py-1.5 text-[12px] font-semibold rounded-md border border-border text-text-muted hover:bg-surface transition-colors">
            <Eraser size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Active crew', value: labours.length, tone: 'text-text-primary' },
          { label: 'Working today', value: working, tone: 'text-green-700' },
          { label: 'Marked', value: `${marked} / ${labours.length}`, tone: 'text-text-primary' },
          { label: 'Pending', value: labours.length - marked, tone: labours.length - marked ? 'text-amber-700' : 'text-text-subtle' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-white px-4 py-3">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-[19px] font-bold leading-none ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={3} />)
        ) : labours.length ? (
          <>
            {labours.map((l) => {
              const entry = draft[l._id] || { status: '' }
              const open = detailFor === l._id
              return (
                <div key={l._id} className="border-b border-border last:border-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-surface/40 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[12px] font-bold shrink-0">
                      {l.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold text-text-primary truncate">{l.name}</p>
                      <p className="text-[12px] text-text-muted truncate">
                        {l.designation || 'Worker'}{l.dailyWage ? ` · ${rupee(l.dailyWage)}/day` : ''}
                      </p>
                      {/* on phones the details toggle sits under the name — the row has no width to spare */}
                      <button onClick={() => setDetailFor(open ? null : l._id)}
                        className={`sm:hidden mt-1 text-[11.5px] transition-colors
                          ${entry.overtimeHours || entry.site || entry.note ? 'text-accent font-medium' : 'text-text-subtle'}`}>
                        {entry.overtimeHours ? `+${entry.overtimeHours}h OT` : 'Details'}
                      </button>
                    </div>

                    <button onClick={() => setDetailFor(open ? null : l._id)}
                      className={`text-[11.5px] px-2 py-1 rounded-md transition-colors hidden sm:block
                        ${entry.overtimeHours || entry.site || entry.note
                          ? 'text-accent bg-accent/10 font-medium' : 'text-text-subtle hover:bg-surface'}`}>
                      {entry.overtimeHours ? `+${entry.overtimeHours}h OT` : 'Details'}
                    </button>

                    <div className="flex gap-1 shrink-0">
                      {STATUS_ORDER.map((s) => {
                        const active = entry.status === s
                        return (
                          <button key={s} onClick={() => setStatus(l._id, active ? '' : s)}
                            title={STATUS_NAME[s]}
                            className={`w-9 h-9 rounded-lg border text-[13px] font-bold transition-all
                              ${active ? `${STATUS_STYLE[s]} scale-105 shadow-sm` : 'border-border text-text-subtle hover:bg-surface'}`}>
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {open && (
                    <div className="grid sm:grid-cols-3 gap-3 px-3 sm:px-4 pb-3.5 bg-surface/40">
                      <div>
                        <label className="block text-[11.5px] font-medium text-text-muted mb-1">Overtime (hours)</label>
                        <input value={entry.overtimeHours || ''} inputMode="numeric"
                          onChange={(e) => setField(l._id, 'overtimeHours', e.target.value)}
                          className="w-full px-3 py-1.5 text-[13px] border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
                      </div>
                      <div>
                        <label className="block text-[11.5px] font-medium text-text-muted mb-1">Site</label>
                        <input value={entry.site || ''}
                          onChange={(e) => setField(l._id, 'site', e.target.value)}
                          placeholder="Sector 62 flat"
                          className="w-full px-3 py-1.5 text-[13px] border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
                      </div>
                      <div>
                        <label className="block text-[11.5px] font-medium text-text-muted mb-1">Note</label>
                        <input value={entry.note || ''}
                          onChange={(e) => setField(l._id, 'note', e.target.value)}
                          className="w-full px-3 py-1.5 text-[13px] border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-border bg-surface/50">
              <p className="text-[12.5px] text-text-muted">
                <b className="text-text-primary">{working}</b> working · {marked} of {labours.length} marked
              </p>
              <button onClick={save} disabled={saveMutation.isPending || !dirty}
                className="btn-accent px-5 py-2 text-[13px] disabled:opacity-50">
                {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Save Attendance
              </button>
            </div>
          </>
        ) : (
          <EmptyState icon={HardHat} title="No active labour"
            description="Add workers on the Labour page first — only active workers appear here." />
        )}
      </div>
    </>
  )
}

/* ── Tab 2: month register ── */
function MonthRegister({ data, isLoading, year, month, readOnly }) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState('')

  const cellMutation = useMutation({
    mutationFn: async ({ labour, iso, status }) => {
      if (status) return api.post('/admin/attendance/mark', { date: iso, entries: [{ labour, status }] })
      return api.delete(`/admin/attendance/one?labour=${labour}&date=${iso}`)
    },
    onMutate: ({ labour, iso }) => setPending(`${labour}:${iso}`),
    onSettled: () => setPending(''),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
    onError: (err) => toast.error(err.message || 'Could not update'),
  })

  const days = data?.days || 31
  const dayList = useMemo(() => Array.from({ length: days }, (_, i) => i + 1), [days])
  const maxISO = todayISO()

  if (isLoading) {
    return <div className="rounded-xl border border-border bg-white overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={8} />)}
    </div>
  }

  if (!data?.labours?.length) {
    return (
      <div className="rounded-xl border border-border bg-white">
        <EmptyState icon={CalendarDays} title="Nothing recorded this month"
          description="Mark attendance from the “Mark Day” tab and it will show up here." />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="text-[12px] border-collapse">
          <thead>
            <tr className="bg-surface/70">
              <th className="sticky left-0 z-20 bg-surface/95 backdrop-blur px-3 py-2 text-left font-semibold text-text-muted border-b border-r border-border min-w-[160px]">
                Name
              </th>
              {dayList.map((d) => (
                <th key={d}
                  className={`px-0 py-2 w-7 text-center font-semibold border-b border-border
                    ${isSunday(year, month, d) ? 'bg-accent/10 text-accent' : 'text-text-muted'}`}>
                  {d}
                </th>
              ))}
              {['P', 'H', 'A', 'Days', 'Wage'].map((h) => (
                <th key={h} className="px-2 py-2 text-center font-semibold text-text-muted border-b border-l border-border whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.labours.map((l) => {
              const marks = data.records[l._id] || {}
              const t = data.totals[l._id] || { P: 0, H: 0, A: 0, payableDays: 0, wage: 0 }
              return (
                <tr key={l._id} className="hover:bg-surface/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-white px-3 py-1.5 border-b border-r border-border">
                    <p className="font-semibold text-text-primary truncate max-w-[150px]">{l.name}</p>
                    <p className="text-[10.5px] text-text-subtle truncate max-w-[150px]">
                      {l.designation || 'Worker'}{l.status !== 'active' ? ` · ${l.status}` : ''}
                    </p>
                  </td>
                  {dayList.map((d) => {
                    const iso = isoFor(year, month, d)
                    const status = marks[iso]?.status || ''
                    const future = iso > maxISO
                    const busy = pending === `${l._id}:${iso}`
                    return (
                      <td key={d} className={`p-0 border-b border-border text-center ${isSunday(year, month, d) ? 'bg-accent/5' : ''}`}>
                        <button
                          disabled={readOnly || future || busy}
                          onClick={() => cellMutation.mutate({ labour: l._id, iso, status: CYCLE[status] })}
                          title={`${l.name} · ${d} ${monthName(month)} — ${STATUS_NAME[status] || 'not marked'}`}
                          className={`w-7 h-7 text-[11px] font-bold transition-colors
                            ${status === 'P' ? 'text-green-700' : status === 'H' ? 'text-amber-700' : status === 'A' ? 'text-red-600' : 'text-text-subtle'}
                            ${readOnly || future ? 'cursor-default' : 'hover:bg-surface cursor-pointer'}
                            ${busy ? 'opacity-40' : ''}`}>
                          {status || (future ? '' : '·')}
                        </button>
                      </td>
                    )
                  })}
                  <td className="px-2 py-1.5 text-center border-b border-l border-border font-semibold text-green-700">{t.P}</td>
                  <td className="px-2 py-1.5 text-center border-b border-border font-semibold text-amber-700">{t.H}</td>
                  <td className="px-2 py-1.5 text-center border-b border-border font-semibold text-red-600">{t.A}</td>
                  <td className="px-2 py-1.5 text-center border-b border-border font-bold text-text-primary">{t.payableDays}</td>
                  <td className="px-2 py-1.5 text-right border-b border-border font-bold text-text-primary whitespace-nowrap">{rupee(t.wage)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-3 border-t border-border bg-surface/50 text-[12px] text-text-muted">
        <span className="font-semibold text-text-primary">Legend:</span>
        <span><b className="text-green-700">P</b> Present</span>
        <span><b className="text-amber-700">H</b> Half Day</span>
        <span><b className="text-red-600">A</b> Absent</span>
        {!readOnly && <span className="ml-auto">Tip: click a cell to cycle P → H → A → blank</span>}
      </div>
    </div>
  )
}

/* ── Page ── */
export default function Attendance() {
  const now = new Date()
  const [tab, setTab] = useState('mark')
  const [ym, setYm] = useState(monthValue(now.getFullYear(), now.getMonth() + 1))
  const [scope, setScope] = useState('active')

  const [yearStr, monthStr] = ym.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'month', year, month, scope],
    queryFn: () => api.get(`/admin/attendance/month?year=${year}&month=${month}&scope=${scope}`),
    enabled: !!year && !!month,
  })

  const grand = useMemo(() => {
    if (!data) return null
    return Object.values(data.totals).reduce((acc, t) => ({
      P: acc.P + t.P, H: acc.H + t.H, A: acc.A + t.A,
      days: acc.days + t.payableDays, wage: acc.wage + t.wage,
    }), { P: 0, H: 0, A: 0, days: 0, wage: 0 })
  }, [data])

  return (
    <div className="max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[20px] font-bold text-text-primary">Attendance</h1>
          <p className="text-[12.5px] text-text-muted mt-0.5">
            Tick P, H or A for each worker. Labour can only view — never edit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={ym} onChange={(e) => e.target.value && setYm(e.target.value)}
            className="px-3 py-2 text-[13px] border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
          <ExportMenu data={data} disabled={isLoading} />
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 p-1 bg-surface rounded-xl w-full sm:w-fit overflow-x-auto">
        {[
          { key: 'mark', label: 'Mark Day', icon: CalendarCheck },
          { key: 'month', label: `${monthName(month)} Register`, icon: CalendarDays },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-[12.5px] sm:text-[13px] font-medium rounded-lg transition-colors whitespace-nowrap
              ${tab === key ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'mark' ? (
        <MarkDay />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex flex-wrap gap-3 flex-1">
              {grand && [
                { label: 'Crew', value: data.labours.length, icon: Users, tone: 'text-text-primary' },
                { label: 'Present', value: grand.P, tone: 'text-green-700' },
                { label: 'Half Day', value: grand.H, tone: 'text-amber-700' },
                { label: 'Absent', value: grand.A, tone: 'text-red-600' },
                { label: 'Payable days', value: grand.days, tone: 'text-text-primary' },
                { label: 'Total wage', value: rupee(grand.wage), tone: 'text-text-primary' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-white px-4 py-2.5 min-w-[110px]">
                  <p className="text-[10.5px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">{s.label}</p>
                  <p className={`text-[17px] font-bold leading-none ${s.tone}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <select value={scope} onChange={(e) => setScope(e.target.value)}
              className="px-3 py-2 text-[13px] border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/30">
              <option value="active">Active crew</option>
              <option value="all">Everyone (incl. inactive)</option>
            </select>
          </div>

          <MonthRegister data={data} isLoading={isLoading} year={year} month={month} readOnly={false} />
        </>
      )}
    </div>
  )
}

export { MonthRegister, ExportMenu, monthValue, rupee }
