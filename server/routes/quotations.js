import { Router } from 'express'
import { z } from 'zod'
import Quotation, { QUOTE_STATUSES, ITEM_KINDS } from '../models/Quotation.js'
import Payment from '../models/Payment.js'
import SiteContent from '../models/SiteContent.js'
import { stripHtml } from '../utils/sanitize.js'
import { computeTotals, financialYear } from '../utils/quoteTotals.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(requireAuth)

const clean = stripHtml

const itemSchema = z.object({
  description: z.string().trim().min(1).max(200),
  section:     z.string().trim().max(60).optional().default(''),
  kind:        z.enum(ITEM_KINDS).optional().default('work'),
  unit:        z.string().trim().max(20).optional().default('sq.ft'),
  qty:         z.coerce.number().min(0).max(1e7).optional().default(0),
  rate:        z.coerce.number().min(0).max(1e7).optional().default(0),
})

const quoteSchema = z.object({
  quoteDate:  z.string().trim().max(20).optional(),
  validDays:  z.coerce.number().int().min(0).max(365).optional(),
  customerName:    z.string().trim().min(1).max(120),
  customerPhone:   z.string().trim().max(20).optional().default(''),
  customerEmail:   z.string().trim().max(120).optional().default(''),
  customerAddress: z.string().trim().max(400).optional().default(''),
  title: z.string().trim().max(160).optional().default(''),
  items: z.array(itemSchema).max(120).optional().default([]),
  discount:      z.coerce.number().min(0).max(1e7).optional().default(0),
  discountIsPct: z.boolean().optional().default(false),
  gstPercent:    z.coerce.number().min(0).max(28).optional().default(0),
  materialCost:  z.coerce.number().min(0).max(1e8).optional().default(0),
  otherCost:     z.coerce.number().min(0).max(1e8).optional().default(0),
  terms:     z.string().max(3000).optional().default(''),
  notes:     z.string().max(2000).optional().default(''),
  signName:  z.string().trim().max(120).optional().default(''),
  signTitle: z.string().trim().max(120).optional().default(''),
  status:    z.enum(QUOTE_STATUSES).optional(),
})

function sanitiseQuote(data) {
  const out = { ...data }
  for (const key of ['customerName', 'customerPhone', 'customerEmail', 'customerAddress',
    'title', 'terms', 'notes', 'signName', 'signTitle']) {
    if (out[key] !== undefined) out[key] = clean(out[key])
  }
  if (out.items) {
    out.items = out.items.map((i) => ({
      ...i, description: clean(i.description), section: clean(i.section), unit: clean(i.unit),
    }))
  }
  return out
}

// Adds computed totals (and money received, when asked) to a plain quotation.
function decorate(quote, received = null) {
  const totals = computeTotals(quote)
  const out = { ...quote, totals }
  if (received !== null) {
    out.received = received
    out.balance = Math.max(0, totals.grandTotal - received)
    out.profit = totals.grandTotal - totals.cost
  }
  return out
}

async function nextQuoteNumber() {
  const fy = financialYear()
  const doc = await SiteContent.findOne({ pageKey: 'letterhead' })
  const prefix = (doc?.sections?.quotePrefix || 'KPS').replace(/[^A-Za-z0-9]/g, '') || 'KPS'
  const last = await Quotation.findOne({ fy }).sort({ serial: -1 }).select('serial').lean()
  const serial = (last?.serial || 0) + 1
  return { fy, serial, quoteNo: `${prefix}/${fy}/${String(serial).padStart(3, '0')}` }
}

/* ── Rate card: the prices typed once, then picked from a dropdown ── */
const RATE_KEY = 'ratecard'

const DEFAULT_RATES = [
  { description: 'Interior painting (2 coats + putty)', section: 'Interior', kind: 'work', unit: 'sq.ft', rate: 18 },
  { description: 'Interior painting — repaint only',    section: 'Interior', kind: 'work', unit: 'sq.ft', rate: 12 },
  { description: 'Exterior weather-shield painting',    section: 'Exterior', kind: 'work', unit: 'sq.ft', rate: 22 },
  { description: 'Wall putty (2 coats)',                section: 'Interior', kind: 'work', unit: 'sq.ft', rate: 9 },
  { description: 'Texture / stencil wall art',          section: 'Interior', kind: 'work', unit: 'sq.ft', rate: 85 },
  { description: 'Wood polish (melamine)',              section: 'Polish',   kind: 'work', unit: 'sq.ft', rate: 45 },
  { description: 'Waterproofing treatment',             section: 'Exterior', kind: 'work', unit: 'sq.ft', rate: 35 },
  { description: 'Labour charge',                       section: '',         kind: 'labour', unit: 'day', rate: 700 },
]

router.get('/ratecard', asyncHandler(async (req, res) => {
  const doc = await SiteContent.findOne({ pageKey: RATE_KEY })
  const items = Array.isArray(doc?.sections?.items) ? doc.sections.items : DEFAULT_RATES
  res.json({ items })
}))

const rateCardSchema = z.object({
  items: z.array(z.object({
    description: z.string().trim().min(1).max(200),
    section:     z.string().trim().max(60).optional().default(''),
    kind:        z.enum(ITEM_KINDS).optional().default('work'),
    unit:        z.string().trim().max(20).optional().default('sq.ft'),
    rate:        z.coerce.number().min(0).max(1e7).optional().default(0),
  })).max(200),
})

router.put('/ratecard', asyncHandler(async (req, res) => {
  const parsed = rateCardSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Check the rate card rows' })

  const items = parsed.data.items.map((i) => ({
    ...i, description: clean(i.description), section: clean(i.section), unit: clean(i.unit),
  }))

  await SiteContent.findOneAndUpdate(
    { pageKey: RATE_KEY },
    { $set: { sections: { items }, updatedBy: req.admin.id } },
    { upsert: true },
  )

  await logActivity('update', 'RateCard', RATE_KEY, req.admin.id)
  res.json({ items })
}))

/* ── List ── */
router.get('/', asyncHandler(async (req, res) => {
  const { status = '', search = '' } = req.query
  const filter = {}
  if (status) filter.status = status
  if (search) {
    const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ customerName: re }, { customerPhone: re }, { quoteNo: re }, { title: re }]
  }

  const quotes = await Quotation.find(filter).sort({ createdAt: -1 }).limit(300).lean()

  // one aggregate instead of a payment query per quotation
  const paid = await Payment.aggregate([
    { $match: { quotation: { $in: quotes.map((q) => q._id) } } },
    { $group: { _id: '$quotation', total: { $sum: '$amount' } } },
  ])
  const paidMap = Object.fromEntries(paid.map((p) => [String(p._id), p.total]))

  res.json(quotes.map((q) => decorate(q, paidMap[String(q._id)] || 0)))
}))

router.get('/next-number', asyncHandler(async (req, res) => {
  res.json(await nextQuoteNumber())
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const quote = await Quotation.findById(req.params.id).lean()
  if (!quote) return res.status(404).json({ error: 'Quotation not found' })

  const payments = await Payment.find({ quotation: quote._id }).sort({ date: -1 }).lean()
  const received = payments.reduce((sum, p) => sum + p.amount, 0)
  res.json({ ...decorate(quote, received), payments })
}))

/* ── Create ── */
router.post('/', asyncHandler(async (req, res) => {
  const parsed = quoteSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Check the customer name and line items', details: parsed.error.flatten() })

  const numbering = await nextQuoteNumber()
  const quote = await Quotation.create({
    ...sanitiseQuote(parsed.data),
    ...numbering,
    createdBy: req.admin.id,
  })

  await logActivity('create', 'Quotation', quote._id, req.admin.id)
  res.status(201).json(decorate(quote.toObject(), 0))
}))

/* ── Update ── */
router.put('/:id', asyncHandler(async (req, res) => {
  const parsed = quoteSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Check the customer name and line items', details: parsed.error.flatten() })

  const update = sanitiseQuote(parsed.data)
  if (update.status === 'Approved') update.approvedAt = new Date()

  const quote = await Quotation.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean()
  if (!quote) return res.status(404).json({ error: 'Quotation not found' })

  await logActivity('update', 'Quotation', quote._id, req.admin.id)
  const received = await Payment.aggregate([
    { $match: { quotation: quote._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  res.json(decorate(quote, received[0]?.total || 0))
}))

/* ── Status only ── */
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const parsed = z.object({ status: z.enum(QUOTE_STATUSES) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid status' })

  const update = { status: parsed.data.status }
  if (parsed.data.status === 'Approved') update.approvedAt = new Date()

  const quote = await Quotation.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean()
  if (!quote) return res.status(404).json({ error: 'Quotation not found' })

  await logActivity('update', 'Quotation', quote._id, req.admin.id)
  res.json({ _id: quote._id, status: quote.status })
}))

/* ── Delete ── */
router.delete('/:id', asyncHandler(async (req, res) => {
  const paidCount = await Payment.countDocuments({ quotation: req.params.id })
  if (paidCount) {
    return res.status(400).json({
      error: `This job has ${paidCount} payment ${paidCount === 1 ? 'entry' : 'entries'}. Delete those first if you really want to remove it.`,
    })
  }

  const quote = await Quotation.findByIdAndDelete(req.params.id)
  if (!quote) return res.status(404).json({ error: 'Quotation not found' })

  await logActivity('delete', 'Quotation', req.params.id, req.admin.id)
  res.json({ ok: true })
}))

export default router
