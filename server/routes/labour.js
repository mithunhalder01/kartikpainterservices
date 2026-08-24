import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import Labour from '../models/Labour.js'
import Attendance from '../models/Attendance.js'
import { stripHtml } from '../utils/sanitize.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(requireAuth)   // labour management is admin-only, always

const clean = stripHtml
const digits = (v) => String(v || '').replace(/\D/g, '')

const SAFE_FIELDS = '-passwordHash -refreshTokenHash'

const baseSchema = {
  name:        z.string().trim().min(1).max(80),
  phone:       z.string().trim().min(6).max(20),
  altPhone:    z.string().trim().max(20).optional().default(''),
  designation: z.string().trim().max(60).optional().default('Painter'),
  dailyWage:   z.coerce.number().min(0).max(100000).optional().default(0),
  overtimeRate:z.coerce.number().min(0).max(10000).optional().default(0),
  joinedOn:    z.string().trim().optional(),
  address:     z.string().trim().max(300).optional().default(''),
  idProof:     z.string().trim().max(60).optional().default(''),
  notes:       z.string().trim().max(1000).optional().default(''),
  status:      z.enum(['active', 'inactive', 'blocked']).optional(),
  canLogin:    z.boolean().optional(),
  password:    z.string().min(6).max(200).optional().or(z.literal('')),
}

const createSchema = z.object(baseSchema)
const updateSchema = z.object(baseSchema).partial()

function applyFields(labour, data) {
  const map = ['name', 'altPhone', 'designation', 'address', 'idProof', 'notes']
  for (const key of map) if (data[key] !== undefined) labour[key] = clean(data[key])
  if (data.phone !== undefined) labour.phone = digits(data.phone)
  if (data.dailyWage !== undefined) labour.dailyWage = data.dailyWage
  if (data.overtimeRate !== undefined) labour.overtimeRate = data.overtimeRate
  if (data.status !== undefined) labour.status = data.status
  if (data.joinedOn) {
    const d = new Date(data.joinedOn)
    if (!Number.isNaN(d.getTime())) labour.joinedOn = d
  }
}

/* ── List ── */
router.get('/', asyncHandler(async (req, res) => {
  const { search = '', status = '' } = req.query
  const filter = {}
  if (status) filter.status = status
  if (search) {
    const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ name: re }, { phone: re }, { designation: re }]
  }

  const labours = await Labour.find(filter).select(SAFE_FIELDS).sort({ status: 1, name: 1 })
  const counts = await Labour.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  const byStatus = { active: 0, inactive: 0, blocked: 0 }
  counts.forEach((c) => { byStatus[c._id] = c.count })

  res.json({ labours, counts: byStatus, total: labours.length })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const labour = await Labour.findById(req.params.id).select(SAFE_FIELDS)
  if (!labour) return res.status(404).json({ error: 'Labour not found' })
  res.json(labour)
}))

/* ── Create ── */
router.post('/', asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Check the name and phone number', details: parsed.error.flatten() })

  const phone = digits(parsed.data.phone)
  if (phone.length < 6) return res.status(400).json({ error: 'Enter a valid phone number' })
  if (await Labour.findOne({ phone })) {
    return res.status(409).json({ error: 'A labour with this phone number already exists' })
  }

  const labour = new Labour({ createdBy: req.admin.id })
  applyFields(labour, { ...parsed.data, phone })

  if (parsed.data.password) {
    labour.passwordHash = await bcrypt.hash(parsed.data.password, 12)
    labour.canLogin = parsed.data.canLogin !== false
  } else {
    labour.canLogin = false
  }

  await labour.save()
  await logActivity('create', 'Labour', labour._id, req.admin.id)

  const out = labour.toObject()
  delete out.passwordHash; delete out.refreshTokenHash
  res.status(201).json(out)
}))

/* ── Update ── */
router.patch('/:id', asyncHandler(async (req, res) => {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })

  const labour = await Labour.findById(req.params.id)
  if (!labour) return res.status(404).json({ error: 'Labour not found' })

  if (parsed.data.phone !== undefined) {
    const phone = digits(parsed.data.phone)
    if (phone.length < 6) return res.status(400).json({ error: 'Enter a valid phone number' })
    const clash = await Labour.findOne({ phone, _id: { $ne: labour._id } })
    if (clash) return res.status(409).json({ error: 'Another labour already uses this phone number' })
  }

  applyFields(labour, parsed.data)

  if (parsed.data.password) {
    labour.passwordHash = await bcrypt.hash(parsed.data.password, 12)
    labour.refreshTokenHash = null          // sign out existing sessions
  }
  if (parsed.data.canLogin !== undefined) {
    labour.canLogin = parsed.data.canLogin && !!(labour.passwordHash || parsed.data.password)
  }
  // blocking or deactivating must kill any live session immediately
  if (labour.status !== 'active') labour.refreshTokenHash = null

  await labour.save()
  await logActivity('update', 'Labour', labour._id, req.admin.id)

  const out = labour.toObject()
  delete out.passwordHash; delete out.refreshTokenHash
  res.json(out)
}))

/* ── Quick status change (active / inactive / blocked) ── */
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const parsed = z.object({ status: z.enum(['active', 'inactive', 'blocked']) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid status' })

  const labour = await Labour.findById(req.params.id)
  if (!labour) return res.status(404).json({ error: 'Labour not found' })

  labour.status = parsed.data.status
  if (labour.status !== 'active') labour.refreshTokenHash = null
  await labour.save()

  await logActivity('update', 'Labour', labour._id, req.admin.id)
  res.json({ _id: labour._id, status: labour.status })
}))

/* ── Delete (also removes attendance history) ── */
router.delete('/:id', asyncHandler(async (req, res) => {
  const labour = await Labour.findByIdAndDelete(req.params.id)
  if (!labour) return res.status(404).json({ error: 'Labour not found' })

  const { deletedCount } = await Attendance.deleteMany({ labour: req.params.id })
  await logActivity('delete', 'Labour', req.params.id, req.admin.id)

  res.json({ ok: true, attendanceRemoved: deletedCount })
}))

export default router
