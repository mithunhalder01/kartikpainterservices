import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import Admin from '../models/Admin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(requireAuth)

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10).max(200),
})

router.put('/password', asyncHandler(async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'New password must be at least 10 characters' })

  const admin = await Admin.findById(req.admin.id)
  if (!admin) return res.status(401).json({ error: 'Not authenticated' })

  const valid = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash)
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })

  admin.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12)
  admin.refreshTokenHash = null // force re-login on all sessions
  await admin.save()

  await logActivity('change-password', 'Admin', admin._id, admin.email)
  res.json({ ok: true })
}))

router.get('/admins', asyncHandler(async (req, res) => {
  const admins = await Admin.find().select('name email lastLoginAt createdAt').sort({ createdAt: 1 })
  res.json(admins)
}))

const createAdminSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(200),
})

router.post('/admins', asyncHandler(async (req, res) => {
  const parsed = createAdminSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Check name, email and password (10+ characters)' })

  const existing = await Admin.findOne({ email: parsed.data.email })
  if (existing) return res.status(409).json({ error: 'An admin with this email already exists' })

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  const admin = await Admin.create({ name: parsed.data.name, email: parsed.data.email, passwordHash })

  await logActivity('create', 'Admin', admin._id, req.admin.id)
  res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, createdAt: admin.createdAt })
}))

export default router
