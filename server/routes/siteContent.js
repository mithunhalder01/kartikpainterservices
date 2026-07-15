import { Router } from 'express'
import { z } from 'zod'
import { stripHtml } from '../utils/sanitize.js'
import SiteContent from '../models/SiteContent.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { handleUpload } from '../middleware/upload.js'
import { uploadImageFile } from '../utils/cloudinary.js'
import { logActivity } from '../utils/activityLog.js'

function sanitizeDeep(value) {
  if (typeof value === 'string') return stripHtml(value)
  if (Array.isArray(value)) return value.map(sanitizeDeep)
  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value)) out[key] = sanitizeDeep(value[key])
    return out
  }
  return value
}

const sectionsSchema = z.object({ sections: z.record(z.string(), z.any()) })

// Builds a public + admin router pair for a single-document, freeform-sections
// page (About, Home, ...) so each new editable page doesn't need its own copy
// of this get/put/upload boilerplate.
export function createSiteContentRouter(pageKey, cloudinaryFolder) {
  const router = Router()

  router.get('/', asyncHandler(async (req, res) => {
    const doc = await SiteContent.findOne({ pageKey })
    res.json(doc?.sections || {})
  }))

  const adminRouter = Router()
  adminRouter.use(requireAuth)

  adminRouter.get('/', asyncHandler(async (req, res) => {
    const doc = await SiteContent.findOne({ pageKey })
    res.json(doc?.sections || {})
  }))

  adminRouter.put('/', asyncHandler(async (req, res) => {
    const parsed = sectionsSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

    const cleanSections = sanitizeDeep(parsed.data.sections)

    const doc = await SiteContent.findOneAndUpdate(
      { pageKey },
      { sections: cleanSections, updatedBy: req.admin.id },
      { new: true, upsert: true },
    )

    await logActivity('update', 'SiteContent', doc._id, req.admin.id)
    res.json(doc.sections)
  }))

  adminRouter.post('/upload', handleUpload, asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' })
    const result = await uploadImageFile(req.file, cloudinaryFolder)
    res.json({ url: result.secure_url, cloudinaryId: result.public_id })
  }))

  return { router, adminRouter }
}
