import { Router } from 'express'
import { z } from 'zod'
import Category from '../models/Category.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(requireAuth)

const schema = z.object({ name: z.string().trim().min(1).max(60) })

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 })
  res.json(categories)
}))

router.post('/', asyncHandler(async (req, res) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  const count = await Category.countDocuments()
  const category = await Category.create({ name: parsed.data.name, order: count })
  await logActivity('create', 'Category', category._id, req.admin.id)
  res.status(201).json(category)
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id)
  if (!category) return res.status(404).json({ error: 'Not found' })
  await logActivity('delete', 'Category', req.params.id, req.admin.id)
  res.json({ ok: true })
}))

export default router
