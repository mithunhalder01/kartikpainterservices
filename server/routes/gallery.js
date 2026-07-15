import { Router } from 'express'
import { z } from 'zod'
import GalleryImage from '../models/GalleryImage.js'
import Category from '../models/Category.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { handleUpload } from '../middleware/upload.js'
import { uploadImageFile, destroyAsset } from '../utils/cloudinary.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()

const upsertSchema = z.object({
  category: z.string().trim().min(1).max(60),
  label: z.string().trim().max(160).optional().default(''),
  isActive: z.coerce.boolean().optional(),
})

/* ── Public ── */
router.get('/', asyncHandler(async (req, res) => {
  const filter = { isActive: true }
  if (req.query.category) filter.category = req.query.category
  const images = await GalleryImage.find(filter).sort({ order: 1, createdAt: -1 })
  res.json(images)
}))

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 })
  res.json(categories)
}))

/* ── Admin ── */
const adminRouter = Router()
adminRouter.use(requireAuth)

adminRouter.get('/', asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.category) filter.category = req.query.category
  const images = await GalleryImage.find(filter).sort({ order: 1, createdAt: -1 })
  res.json(images)
}))

adminRouter.post('/', handleUpload, asyncHandler(async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  if (!req.file) return res.status(400).json({ error: 'Image file is required' })

  const result = await uploadImageFile(req.file, 'kartik-painter/gallery')

  const count = await GalleryImage.countDocuments({ category: parsed.data.category })
  const image = await GalleryImage.create({
    imageUrl: result.secure_url,
    cloudinaryId: result.public_id,
    category: parsed.data.category,
    label: parsed.data.label,
    order: count,
    updatedBy: req.admin.id,
  })

  await logActivity('create', 'GalleryImage', image._id, req.admin.id)
  res.status(201).json(image)
}))

adminRouter.put('/:id', asyncHandler(async (req, res) => {
  const parsed = upsertSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })

  const image = await GalleryImage.findByIdAndUpdate(
    req.params.id,
    { ...parsed.data, updatedBy: req.admin.id },
    { new: true },
  )
  if (!image) return res.status(404).json({ error: 'Not found' })

  await logActivity('update', 'GalleryImage', image._id, req.admin.id)
  res.json(image)
}))

adminRouter.patch('/reorder', asyncHandler(async (req, res) => {
  const schema = z.object({ items: z.array(z.object({ id: z.string(), order: z.number() })) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  await Promise.all(parsed.data.items.map(({ id, order }) =>
    GalleryImage.findByIdAndUpdate(id, { order, updatedBy: req.admin.id }),
  ))

  await logActivity('reorder', 'GalleryImage', '', req.admin.id)
  res.json({ ok: true })
}))

adminRouter.delete('/:id', asyncHandler(async (req, res) => {
  const image = await GalleryImage.findByIdAndDelete(req.params.id)
  if (!image) return res.status(404).json({ error: 'Not found' })
  await destroyAsset(image.cloudinaryId)
  await logActivity('delete', 'GalleryImage', req.params.id, req.admin.id)
  res.json({ ok: true })
}))

export { adminRouter as galleryAdminRouter }
export default router
