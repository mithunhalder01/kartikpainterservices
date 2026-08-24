import { Router } from 'express'
import { z } from 'zod'
import Labour from '../models/Labour.js'
import Attendance, { STATUSES, DAY_VALUE } from '../models/Attendance.js'
import { stripHtml } from '../utils/sanitize.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireUser, requireAdmin } from '../middleware/requireAuth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(requireUser)   // labour may READ; every write is behind requireAdmin

const clean = stripHtml

/* ── date helpers — every stored date is UTC midnight ── */
const ISO = /^\d{4}-\d{2}-\d{2}$/

function toUTCDate(iso) {
  if (!ISO.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  if (Number.isNaN(date.getTime()) || date.getUTCMonth() !== m - 1) return null
  return date
}

const toISO = (date) => new Date(date).toISOString().slice(0, 10)
const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate()

function monthRange(year, month) {
  return {
    $gte: new Date(Date.UTC(year, month - 1, 1)),
    $lte: new Date(Date.UTC(year, month - 1, daysInMonth(year, month))),
  }
}

function emptyTotals() {
  return { P: 0, H: 0, A: 0, marked: 0, payableDays: 0, overtimeHours: 0, wage: 0 }
}

/* ── GET /month — the whole register for one month ── */
const monthQuery = z.object({
  year:  z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  scope: z.enum(['active', 'all']).optional().default('active'),
})

router.get('/month', asyncHandler(async (req, res) => {
  const parsed = monthQuery.safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid month' })
  const { year, month, scope } = parsed.data
  const range = monthRange(year, month)

  const isLabour = req.user.role === 'labour'
  const recordFilter = { date: range }
  if (isLabour) recordFilter.labour = req.user.id

  const rows = await Attendance.find(recordFilter).lean()

  let labourFilter
  if (isLabour) {
    labourFilter = { _id: req.user.id }
  } else if (scope === 'all') {
    labourFilter = {}
  } else {
    // active crew, plus anyone who already has a mark this month so history
    // never disappears when a worker is deactivated mid-month
    const withRecords = [...new Set(rows.map((r) => String(r.labour)))]
    labourFilter = { $or: [{ status: 'active' }, { _id: { $in: withRecords } }] }
  }

  const labours = await Labour.find(labourFilter)
    .select('name phone designation dailyWage status joinedOn')
    .sort({ status: 1, name: 1 })
    .lean()

  const records = {}
  const totals = {}
  for (const l of labours) {
    records[l._id] = {}
    totals[l._id] = emptyTotals()
  }

  for (const r of rows) {
    const key = String(r.labour)
    if (!records[key]) continue
    records[key][toISO(r.date)] = {
      status: r.status,
      overtimeHours: r.overtimeHours || 0,
      site: r.site || '',
      note: r.note || '',
    }
    const t = totals[key]
    t[r.status] += 1
    t.marked += 1
    t.payableDays += DAY_VALUE[r.status]
    t.overtimeHours += r.overtimeHours || 0
  }

  for (const l of labours) {
    totals[l._id].wage = Math.round(totals[l._id].payableDays * (l.dailyWage || 0))
  }

  res.json({
    year,
    month,
    days: daysInMonth(year, month),
    role: req.user.role,
    labours,
    records,
    totals,
  })
}))

/* ── GET /day — quick sheet for one date ── */
router.get('/day', asyncHandler(async (req, res) => {
  const date = toUTCDate(String(req.query.date || ''))
  if (!date) return res.status(400).json({ error: 'Invalid date' })

  const isLabour = req.user.role === 'labour'
  const labours = await Labour.find(isLabour ? { _id: req.user.id } : { status: 'active' })
    .select('name phone designation dailyWage status')
    .sort({ name: 1 })
    .lean()

  const rows = await Attendance.find({
    date,
    labour: { $in: labours.map((l) => l._id) },
  }).lean()

  const marks = {}
  rows.forEach((r) => {
    marks[String(r.labour)] = {
      status: r.status, overtimeHours: r.overtimeHours || 0, site: r.site || '', note: r.note || '',
    }
  })

  res.json({ date: toISO(date), labours, marks })
}))

/* ── POST /mark — bulk upsert one day (admin only) ── */
const entrySchema = z.object({
  labour: z.string().trim().min(1),
  status: z.enum(STATUSES),
  overtimeHours: z.coerce.number().min(0).max(24).optional().default(0),
  site: z.string().trim().max(120).optional().default(''),
  note: z.string().trim().max(300).optional().default(''),
})

const markSchema = z.object({
  date: z.string().trim(),
  entries: z.array(entrySchema).min(1).max(500),
})

router.post('/mark', requireAdmin, asyncHandler(async (req, res) => {
  const parsed = markSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid attendance data', details: parsed.error.flatten() })

  const date = toUTCDate(parsed.data.date)
  if (!date) return res.status(400).json({ error: 'Invalid date' })
  if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Attendance cannot be marked for a future date' })
  }

  const ids = [...new Set(parsed.data.entries.map((e) => e.labour))]
  const valid = await Labour.find({ _id: { $in: ids } }).select('_id status').lean()
  const validIds = new Set(valid.filter((l) => l.status !== 'blocked').map((l) => String(l._id)))

  const ops = parsed.data.entries
    .filter((e) => validIds.has(e.labour))
    .map((e) => ({
      updateOne: {
        filter: { labour: e.labour, date },
        update: {
          $set: {
            status: e.status,
            overtimeHours: e.overtimeHours,
            site: clean(e.site),
            note: clean(e.note),
            markedBy: req.user.id,
          },
        },
        upsert: true,
      },
    }))

  if (!ops.length) return res.status(400).json({ error: 'No valid labour selected' })

  await Attendance.bulkWrite(ops, { ordered: false })
  await logActivity('mark-attendance', 'Attendance', toISO(date), req.user.id)

  res.json({ ok: true, date: toISO(date), saved: ops.length })
}))

/* ── DELETE /one — clear a single mark (admin only) ── */
router.delete('/one', requireAdmin, asyncHandler(async (req, res) => {
  const date = toUTCDate(String(req.query.date || ''))
  const labour = String(req.query.labour || '')
  if (!date || !labour) return res.status(400).json({ error: 'labour and date are required' })

  await Attendance.deleteOne({ labour, date })
  await logActivity('clear-attendance', 'Attendance', `${labour}:${toISO(date)}`, req.user.id)
  res.json({ ok: true })
}))

/* ── GET /overview — small stat block for the dashboard ── */
router.get('/overview', asyncHandler(async (req, res) => {
  const today = new Date()
  const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))

  const isLabour = req.user.role === 'labour'
  const scope = isLabour ? { labour: req.user.id } : {}

  const [activeCrew, todayRows] = await Promise.all([
    isLabour ? 1 : Labour.countDocuments({ status: 'active' }),
    Attendance.find({ ...scope, date }).lean(),
  ])

  const today_ = { P: 0, H: 0, A: 0 }
  todayRows.forEach((r) => { today_[r.status] += 1 })

  res.json({
    date: toISO(date),
    activeCrew,
    marked: todayRows.length,
    pending: Math.max(0, activeCrew - todayRows.length),
    today: today_,
  })
}))

export default router
