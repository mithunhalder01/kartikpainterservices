import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Info } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { SkeletonRow } from '../components/Skeleton'
import { isoFor, monthName } from '../utils/attendanceExport'
import { rupee as inr } from '../utils/money'
import { ExportMenu, monthValue, rupee } from './Attendance'

const CELL = {
  P: 'bg-green-100 text-green-800 border-green-200',
  H: 'bg-amber-100 text-amber-800 border-amber-200',
  A: 'bg-red-100 text-red-700 border-red-200',
}
const NAME = { P: 'Present', H: 'Half Day', A: 'Absent' }
const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MyAttendance() {
  const { user } = useAuth()
  const now = new Date()
  const [ym, setYm] = useState(monthValue(now.getFullYear(), now.getMonth() + 1))
  const [year, month] = ym.split('-').map(Number)

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'month', year, month, 'self'],
    queryFn: () => api.get(`/admin/attendance/month?year=${year}&month=${month}`),
    enabled: !!year && !!month,
  })

  // the same ledger the admin sees, scoped to this worker by the server
  const { data: ledger } = useQuery({
    queryKey: ['labour-ledger', 'self', year, month],
    queryFn: () => api.get(`/admin/labour-payments/ledger?year=${year}&month=${month}`),
    enabled: !!year && !!month,
  })

  const me = data?.labours?.[0]
  const marks = me ? data.records[me._id] || {} : {}
  const totals = me ? data.totals[me._id] || {} : {}
  const myLedger = me && ledger?.rows ? ledger.rows[me._id] : null
  const myEntries = ledger?.entries || []

  // leading blanks so the 1st lands on the right weekday
  const cells = useMemo(() => {
    if (!data) return []
    const lead = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: data.days }, (_, i) => i + 1),
    ]
  }, [data, year, month])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[20px] font-bold text-text-primary">My Attendance</h1>
          <p className="text-[12.5px] text-text-muted mt-0.5">
            {user?.name}{user?.designation ? ` · ${user.designation}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={ym} onChange={(e) => e.target.value && setYm(e.target.value)}
            className="px-3 py-2 text-[13px] border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
          <ExportMenu data={data} disabled={isLoading} />
        </div>
      </div>

      <div className="flex items-start gap-2 mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">
        <Info size={15} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[12.5px] text-blue-800">
          Attendance is marked by the admin only. If something looks wrong, please tell the office.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Present', value: totals.P || 0, tone: 'text-green-700' },
          { label: 'Half Day', value: totals.H || 0, tone: 'text-amber-700' },
          { label: 'Absent', value: totals.A || 0, tone: 'text-red-600' },
          { label: 'Payable days', value: totals.payableDays || 0, tone: 'text-text-primary' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-white px-4 py-3">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-[20px] font-bold leading-none ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {me?.dailyWage > 0 && myLedger && (
        <div className="rounded-xl border border-border bg-white p-4 mb-5">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-3">
            Hisaab — {monthName(month)} {year}
          </p>

          <div className="space-y-1.5 text-[13px]">
            <div className="flex justify-between">
              <span className="text-text-muted">{myLedger.payableDays || 0} days × {inr(me.dailyWage)}</span>
              <span className="font-medium">{inr(myLedger.dayWage)}</span>
            </div>
            {myLedger.overtimeHours > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">{myLedger.overtimeHours}h overtime</span>
                <span className="font-medium">{inr(myLedger.overtimePay)}</span>
              </div>
            )}
            {myLedger.bonus > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Bonus</span>
                <span className="font-medium text-green-700">{inr(myLedger.bonus)}</span>
              </div>
            )}
            {myLedger.advance > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Advance liya</span>
                <span className="font-medium text-red-600">− {inr(myLedger.advance)}</span>
              </div>
            )}
            {myLedger.payment > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Payment mila</span>
                <span className="font-medium text-red-600">− {inr(myLedger.payment)}</span>
              </div>
            )}
            {myLedger.deduction > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Deduction</span>
                <span className="font-medium text-red-600">− {inr(myLedger.deduction)}</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-border">
            <span className="text-[13px] font-semibold text-text-primary">Baaki</span>
            <span className={`text-[24px] font-bold ${myLedger.balance > 0 ? 'text-green-700' : 'text-text-primary'}`}>
              {inr(myLedger.balance)}
            </span>
          </div>

          {myEntries.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Entries</p>
              <div className="space-y-1.5">
                {myEntries.map((e) => (
                  <div key={e._id} className="flex items-center justify-between text-[12.5px]">
                    <span className="text-text-muted">
                      {new Date(e.date).toLocaleDateString('en-IN')} · <span className="capitalize">{e.type}</span>
                      {e.note ? ` · ${e.note}` : ''}
                    </span>
                    <span className="font-medium text-text-primary">{inr(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {WEEK.map((d) => (
                <p key={d} className="text-center text-[11px] font-semibold text-text-subtle uppercase">{d}</p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((day, i) => {
                if (!day) return <div key={`x${i}`} />
                const mark = marks[isoFor(year, month, day)]
                return (
                  <div key={day}
                    title={mark ? `${NAME[mark.status]}${mark.site ? ` · ${mark.site}` : ''}` : 'Not marked'}
                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center
                      ${mark ? CELL[mark.status] : 'border-border bg-surface/40 text-text-subtle'}`}>
                    <span className="text-[11px] leading-none opacity-70">{day}</span>
                    <span className="text-[13px] font-bold leading-none mt-1">{mark?.status || '·'}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-border text-[12px] text-text-muted">
              <span className="font-semibold text-text-primary">Legend:</span>
              <span><b className="text-green-700">P</b> Present</span>
              <span><b className="text-amber-700">H</b> Half Day</span>
              <span><b className="text-red-600">A</b> Absent</span>
              <span><b className="text-text-subtle">·</b> Not marked</span>
            </div>
          </>
        )}
      </div>

      {!isLoading && !Object.keys(marks).length && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-text-muted mt-3">
          <CalendarDays size={14} /> No attendance recorded for {monthName(month)} {year} yet.
        </p>
      )}
    </div>
  )
}
