import { Router } from 'express'
import { z } from 'zod'
import Payment, { PAY_MODES } from '../models/Payment.js'
import Quotation from '../models/Quotation.js'
import { stripHtml } from '../utils/sanitize.js'
import { computeTotals } from '../utils/quoteTotals.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(requireAuth)

const clean = stripHtml
const DAY = 24 * 60 * 60 * 1000

// Only approved / completed quotations are real jobs with money attached; a draft
// or rejected quote must never show up in the khata.
const JOB_STATUSES = ['Approved', 'Completed']

/* ── Khata: every live job with what is still owed ── */
router.get('/ledger', asyncHandler(async (req, res) => {
  const { search = '', show = 'pending' } = req.query

  const filter = { status: { $in: JOB_STATUSES } }
  if (search) {
    const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ customerName: re }, { customerPhone: re }, { quoteNo: re }, { title: re }]
  }

  const jobs = await Quotation.find(filter).sort({ approvedAt: -1, createdAt: -1 }).lean()

  const rows = await Payment.aggregate([
    { $match: { quotation: { $in: jobs.map((j) => j._id) } } },
    { $group: { _id: '$quotation', total: { $sum: '$amount' }, last: { $max: '$date' }, count: { $sum: 1 } } },
  ])
  const paidMap = Object.fromEntries(rows.map((r) => [String(r._id), r]))

  const now = Date.now()
  let ledger = jobs.map((job) => {
    const totals = computeTotals(job)
    const paidRow = paidMap[String(job._id)]
    const received = paidRow?.total || 0
    const balance = Math.max(0, totals.grandTotal - received)
    const since = paidRow?.last || job.approvedAt || job.createdAt
    return {
      _id: job._id,
      quoteNo: job.quoteNo,
      title: job.title,
      status: job.status,
      customerName: job.customerName,
      customerPhone: job.customerPhone,
      total: totals.grandTotal,
      cost: totals.cost,
      profit: totals.grandTotal - totals.cost,
      received,
      balance,
      payments: paidRow?.count || 0,
      lastPaymentAt: paidRow?.last || null,
      // days since the last money moved — what makes an old due feel old
      ageDays: Math.max(0, Math.floor((now - new Date(since).getTime()) / DAY)),
    }
  })

  if (show === 'pending') ledger = ledger.filter((r) => r.balance > 0)
  else if (show === 'settled') ledger = ledger.filter((r) => r.balance === 0)

  // oldest unpaid money first — that is the row that needs a phone call
  ledger.sort((a, b) => (b.balance > 0 ? 1 : 0) - (a.balance > 0 ? 1 : 0) || b.ageDays - a.ageDays)

  const summary = ledger.reduce((acc, r) => {
    acc.total += r.total; acc.received += r.received; acc.balance += r.balance
    if (r.balance > 0) acc.pendingJobs += 1
    if (r.balance > 0 && r.ageDays > 30) acc.overdue += r.balance
    return acc
  }, { total: 0, received: 0, balance: 0, pendingJobs: 0, overdue: 0 })

  res.json({ ledger, summary })
}))

/* ── Payments for one job ── */
router.get('/', asyncHandler(async (req, res) => {
  const { quotation } = req.query
  const filter = quotation ? { quotation } : {}
  const payments = await Payment.find(filter).sort({ date: -1 }).limit(500)
    .populate('quotation', 'quoteNo customerName title').lean()
  res.json(payments)
}))

const paymentSchema = z.object({
  quotation: z.string().trim().min(1),
  date:      z.string().trim().min(1),
  amount:    z.coerce.number().min(1).max(1e8),
  mode:      z.enum(PAY_MODES).optional().default('Cash'),
  reference: z.string().trim().max(80).optional().default(''),
  note:      z.string().trim().max(300).optional().default(''),
})

router.post('/', asyncHandler(async (req, res) => {
  const parsed = paymentSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid date and amount' })

  const job = await Quotation.findById(parsed.data.quotation)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  if (!JOB_STATUSES.includes(job.status)) {
    return res.status(400).json({ error: 'Mark the quotation as Approved before recording payments against it' })
  }

  const date = new Date(parsed.data.date)
  if (Number.isNaN(date.getTime())) return res.status(400).json({ error: 'Enter a valid date' })

  const payment = await Payment.create({
    ...parsed.data,
    date,
    reference: clean(parsed.data.reference),
    note: clean(parsed.data.note),
    recordedBy: req.admin.id,
  })

  await logActivity('create', 'Payment', payment._id, req.admin.id)
  res.status(201).json(payment)
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id)
  if (!payment) return res.status(404).json({ error: 'Payment not found' })
  await logActivity('delete', 'Payment', req.params.id, req.admin.id)
  res.json({ ok: true })
}))

export default router
