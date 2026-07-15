import { Router } from 'express'
import { z } from 'zod'
import { stripHtml } from '../utils/sanitize.js'
import Service from '../models/Service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { handleUpload } from '../middleware/upload.js'
import { uploadImageFile, destroyAsset } from '../utils/cloudinary.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
const clean = stripHtml

const csv = z.union([z.array(z.string()), z.string()]).transform((v) => {
  const arr = Array.isArray(v) ? v : (v ? JSON.parse(v) : [])
  return arr.map((s) => clean(String(s).trim())).filter(Boolean)
})

const upsertSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only'),
  iconName: z.string().trim().max(40).optional().default('Layers'),
  title: z.string().trim().min(1).max(120),
  shortDesc: z.string().trim().max(400).optional().default(''),
  desc: z.string().trim().max(800).optional().default(''),
  longDesc: z.string().trim().max(3000).optional().default(''),
  price: z.string().trim().max(60).optional().default(''),
  seoTitle: z.string().trim().max(200).optional().default(''),
  seoDesc: z.string().trim().max(300).optional().default(''),
  seoKeywords: z.string().trim().max(400).optional().default(''),
  features: csv.optional().default([]),
  areas: csv.optional().default([]),
  isActive: z.coerce.boolean().optional(),
})

/* ── Public ── */
router.get('/', asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 })
  res.json(services)
}))

router.get('/:slug', asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug, isActive: true })
  if (!service) return res.status(404).json({ error: 'Not found' })
  res.json(service)
}))

/* ── Admin ── */
const adminRouter = Router()
adminRouter.use(requireAuth)

adminRouter.get('/', asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ order: 1, createdAt: 1 })
  res.json(services)
}))

adminRouter.post('/', handleUpload, asyncHandler(async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })

  const existing = await Service.findOne({ slug: parsed.data.slug })
  if (existing) return res.status(409).json({ error: 'A service with this slug already exists' })

  let image = ''
  let cloudinaryId = ''
  if (req.file) {
    const result = await uploadImageFile(req.file, 'kartik-painter/services')
    image = result.secure_url
    cloudinaryId = result.public_id
  }

  const count = await Service.countDocuments()
  const service = await Service.create({
    ...parsed.data,
    title: clean(parsed.data.title),
    shortDesc: clean(parsed.data.shortDesc),
    desc: clean(parsed.data.desc),
    longDesc: clean(parsed.data.longDesc),
    image,
    cloudinaryId,
    order: count,
    updatedBy: req.admin.id,
  })

  await logActivity('create', 'Service', service._id, req.admin.id)
  res.status(201).json(service)
}))

adminRouter.put('/:id', handleUpload, asyncHandler(async (req, res) => {
  const parsed = upsertSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })

  const existing = await Service.findById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const update = { ...parsed.data, updatedBy: req.admin.id }
  for (const field of ['title', 'shortDesc', 'desc', 'longDesc']) {
    if (update[field]) update[field] = clean(update[field])
  }

  if (req.file) {
    const result = await uploadImageFile(req.file, 'kartik-painter/services')
    await destroyAsset(existing.cloudinaryId)
    update.image = result.secure_url
    update.cloudinaryId = result.public_id
  }

  const service = await Service.findByIdAndUpdate(req.params.id, update, { new: true })
  await logActivity('update', 'Service', service._id, req.admin.id)
  res.json(service)
}))

adminRouter.patch('/reorder', asyncHandler(async (req, res) => {
  const schema = z.object({ items: z.array(z.object({ id: z.string(), order: z.number() })) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  await Promise.all(parsed.data.items.map(({ id, order }) =>
    Service.findByIdAndUpdate(id, { order, updatedBy: req.admin.id }),
  ))

  await logActivity('reorder', 'Service', '', req.admin.id)
  res.json({ ok: true })
}))

adminRouter.delete('/:id', asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id)
  if (!service) return res.status(404).json({ error: 'Not found' })
  await destroyAsset(service.cloudinaryId)
  await logActivity('delete', 'Service', req.params.id, req.admin.id)
  res.json({ ok: true })
}))

export { adminRouter as servicesAdminRouter }
export default router
