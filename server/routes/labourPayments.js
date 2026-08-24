import { Router } from 'express'
import { z } from 'zod'
import Labour from '../models/Labour.js'
import Attendance, { DAY_VALUE } from '../models/Attendance.js'
import LabourPayment, { LABOUR_ENTRY_TYPES, PAY_MODES } from '../models/LabourPayment.js'
import { stripHtml } from '../utils/sanitize.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireUser, requireAdmin } from '../middleware/requireAuth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(requireUser)   // a worker may read their own ledger; only admins write

const clean = stripHtml

// bonus adds to what the worker is owed; everything else settles or reduces it
const SIGN = { bonus: 1, advance: -1, payment: -1, deduction: -1 }

const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate()
const monthRange = (y, m) => ({
  $gte: new Date(Date.UTC(y, m - 1, 1)),
  $lte: new Date(Date.UTC(y, m - 1, daysInMonth(y, m), 23, 59, 59)),
})

function emptyRow() {
  return {
    P: 0, H: 0, A: 0, payableDays: 0, overtimeHours: 0,
    dayWage: 0, overtimePay: 0, earned: 0,
    advance: 0, payment: 0, bonus: 0, deduction: 0, settled: 0, balance: 0,
  }
}

/* ── Monthly ledger: earned from the register, minus what was actually handed over ──
   Wages are valued at each worker's CURRENT daily rate. For a two-person business
   that is the honest simplification; raising someone's rate does re-value their
   past months, which the UI says out loud. */
const ledgerQuery = z.object({
  year:  z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  scope: z.enum(['active', 'all']).optional().default('active'),
})

router.get('/ledger', asyncHandler(async (req, res) => {
  const parsed = ledgerQuery.safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid month' })
  const { year, month, scope } = parsed.data
  const range = monthRange(year, month)

  const isLabour = req.user.role === 'labour'
  const labourFilter = isLabour
    ? { _id: req.user.id }
    : (scope === 'all' ? {} : { status: { $ne: 'blocked' } })

  const labours = await Labour.find(labourFilter)
    .select('name phone designation dailyWage overtimeRate status')
    .sort({ status: 1, name: 1 })
    .lean()

  const ids = labours.map((l) => l._id)
  const [attendance, entries] = await Promise.all([
    Attendance.find({ labour: { $in: ids }, date: range }).lean(),
    LabourPayment.find({ labour: { $in: ids }, date: range }).sort({ date: -1 }).lean(),
  ])

  const rows = {}
  labours.forEach((l) => { rows[l._id] = emptyRow() })

  for (const a of attendance) {
    const row = rows[a.labour]
    if (!row) continue
    row[a.status] += 1
    row.payableDays += DAY_VALUE[a.status]
    row.overtimeHours += a.overtimeHours || 0
  }

  for (const e of entries) {
    const row = rows[e.labour]
    if (!row) continue
    row[e.type] += e.amount
  }

  for (const l of labours) {
    const row = rows[l._id]
    row.dayWage = Math.round(row.payableDays * (l.dailyWage || 0))
    row.overtimePay = Math.round(row.overtimeHours * (l.overtimeRate || 0))
    row.earned = row.dayWage + row.overtimePay + row.bonus
    row.settled = row.advance + row.payment + row.deduction
    row.balance = row.earned - row.settled
  }

  const summary = labours.reduce((acc, l) => {
    const r = rows[l._id]
    acc.earned += r.earned; acc.settled += r.settled; acc.balance += r.balance
    acc.advance += r.advance; acc.payment += r.payment
    return acc
  }, { earned: 0, settled: 0, balance: 0, advance: 0, payment: 0 })

  res.json({
    year, month, role: req.user.role,
    labours, rows, entries, summary,
  })
}))

/* ── Full history for one worker ── */
router.get('/history/:labourId', asyncHandler(async (req, res) => {
  if (req.user.role === 'labour' && req.params.labourId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const entries = await LabourPayment.find({ labour: req.params.labourId })
    .sort({ date: -1 }).limit(300).lean()
  res.json(entries)
}))

/* ── Record an advance / payment (admin only) ── */
const entrySchema = z.object({
  labour: z.string().trim().min(1),
  date:   z.string().trim().min(1),
  amount: z.coerce.number().min(1).max(1e7),
  type:   z.enum(LABOUR_ENTRY_TYPES).optional().default('payment'),
  mode:   z.enum(PAY_MODES).optional().default('Cash'),
  note:   z.string().trim().max(300).optional().default(''),
})

router.post('/entries', requireAdmin, asyncHandler(async (req, res) => {
  const parsed = entrySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid date and amount' })

  const labour = await Labour.findById(parsed.data.labour).select('_id').lean()
  if (!labour) return res.status(404).json({ error: 'Labour not found' })

  const date = new Date(parsed.data.date)
  if (Number.isNaN(date.getTime())) return res.status(400).json({ error: 'Enter a valid date' })

  const entry = await LabourPayment.create({
    ...parsed.data, date, note: clean(parsed.data.note), paidBy: req.user.id,
  })

  await logActivity('create', 'LabourPayment', entry._id, req.user.id)
  res.status(201).json(entry)
}))

router.delete('/entries/:id', requireAdmin, asyncHandler(async (req, res) => {
  const entry = await LabourPayment.findByIdAndDelete(req.params.id)
  if (!entry) return res.status(404).json({ error: 'Entry not found' })
  await logActivity('delete', 'LabourPayment', req.params.id, req.user.id)
  res.json({ ok: true })
}))

export { SIGN }
export default router
