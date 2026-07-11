import { Router } from 'express'
import { z } from 'zod'
import sanitizeHtml from 'sanitize-html'
import Lead from '../models/Lead.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { leadSubmitLimiter } from '../middleware/rateLimiters.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
const clean = (text = '') => sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} })

const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().email().optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().default(''),
  serviceInterested: z.string().trim().max(100).optional().default(''),
  area: z.string().trim().max(100).optional().default(''),
  source: z.string().trim().max(50).optional().default('Contact Form'),
  website: z.string().max(0).optional(), // honeypot — real users never fill this
})

/* ── Public ── */
router.post('/', leadSubmitLimiter, asyncHandler(async (req, res) => {
  const parsed = leadSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })

  const { website, ...data } = parsed.data
  if (website) return res.status(201).json({ ok: true }) // silently drop bot submissions

  const lead = await Lead.create({
    ...data,
    name: clean(data.name),
    message: clean(data.message),
  })

  await logActivity('create', 'Lead', lead._id, 'public')
  res.status(201).json({ ok: true })
}))

/* ── Admin ── */
const adminRouter = Router()
adminRouter.use(requireAuth)

adminRouter.get('/', asyncHandler(async (req, res) => {
  const { status, search, from, to, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status
  if (from || to) {
    filter.createdAt = {}
    if (from) filter.createdAt.$gte = new Date(from)
    if (to) filter.createdAt.$lte = new Date(to)
  }
  if (search) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ name: re }, { phone: re }, { email: re }]
  }

  const pageNum = Math.max(1, Number(page) || 1)
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20))

  const [leads, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Lead.countDocuments(filter),
  ])

  res.json({ leads, total, page: pageNum, pages: Math.ceil(total / limitNum) })
}))

const updateSchema = z.object({
  status: z.enum(['New', 'Contacted', 'Quoted', 'Won', 'Lost']).optional(),
  note: z.string().trim().min(1).max(1000).optional(),
})

adminRouter.patch('/:id', asyncHandler(async (req, res) => {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  const lead = await Lead.findById(req.params.id)
  if (!lead) return res.status(404).json({ error: 'Not found' })

  if (parsed.data.status) lead.status = parsed.data.status
  if (parsed.data.note) lead.notes.push({ text: clean(parsed.data.note) })
  await lead.save()

  await logActivity('update', 'Lead', lead._id, req.admin.id)
  res.json(lead)
}))

adminRouter.delete('/:id', asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id)
  if (!lead) return res.status(404).json({ error: 'Not found' })
  await logActivity('delete', 'Lead', req.params.id, req.admin.id)
  res.json({ ok: true })
}))

export { adminRouter as leadsAdminRouter }
export default router
