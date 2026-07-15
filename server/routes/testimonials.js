import { Router } from 'express'
import { z } from 'zod'
import { stripHtml } from '../utils/sanitize.js'
import Testimonial from '../models/Testimonial.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { handleUpload } from '../middleware/upload.js'
import { uploadImageFile, destroyAsset } from '../utils/cloudinary.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()

const upsertSchema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().max(100).optional().default(''),
  stars: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(1).max(2000),
  isActive: z.coerce.boolean().optional(),
})

const clean = stripHtml

/* ── Public ── */
router.get('/', asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 })
  res.json(testimonials)
}))

/* ── Admin ── */
const adminRouter = Router()
adminRouter.use(requireAuth)

adminRouter.get('/', asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 })
  res.json(testimonials)
}))

adminRouter.post('/', handleUpload, asyncHandler(async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })

  let photoUrl = ''
  let cloudinaryId = ''
  if (req.file) {
    const result = await uploadImageFile(req.file, 'kartik-painter/testimonials')
    photoUrl = result.secure_url
    cloudinaryId = result.public_id
  }

  const count = await Testimonial.countDocuments()
  const testimonial = await Testimonial.create({
    ...parsed.data,
    text: clean(parsed.data.text),
    photoUrl,
    cloudinaryId,
    order: count,
    updatedBy: req.admin.id,
  })

  await logActivity('create', 'Testimonial', testimonial._id, req.admin.id)
  res.status(201).json(testimonial)
}))

adminRouter.put('/:id', handleUpload, asyncHandler(async (req, res) => {
  const parsed = upsertSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })

  const update = { ...parsed.data, updatedBy: req.admin.id }
  if (update.text) update.text = clean(update.text)

  const existing = await Testimonial.findById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })

  if (req.file) {
    const result = await uploadImageFile(req.file, 'kartik-painter/testimonials')
    await destroyAsset(existing.cloudinaryId)
    update.photoUrl = result.secure_url
    update.cloudinaryId = result.public_id
  }

  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, update, { new: true })
  await logActivity('update', 'Testimonial', testimonial._id, req.admin.id)
  res.json(testimonial)
}))

adminRouter.patch('/reorder', asyncHandler(async (req, res) => {
  const schema = z.object({ items: z.array(z.object({ id: z.string(), order: z.number() })) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  await Promise.all(parsed.data.items.map(({ id, order }) =>
    Testimonial.findByIdAndUpdate(id, { order, updatedBy: req.admin.id }),
  ))

  await logActivity('reorder', 'Testimonial', '', req.admin.id)
  res.json({ ok: true })
}))

adminRouter.delete('/:id', asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id)
  if (!testimonial) return res.status(404).json({ error: 'Not found' })
  await destroyAsset(testimonial.cloudinaryId)
  await logActivity('delete', 'Testimonial', req.params.id, req.admin.id)
  res.json({ ok: true })
}))

export { adminRouter as testimonialsAdminRouter }
export default router
