import { Router } from 'express'
import { z } from 'zod'
import SiteContent from '../models/SiteContent.js'
import Letter from '../models/Letter.js'
import { stripHtml } from '../utils/sanitize.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { handleUpload } from '../middleware/upload.js'
import { uploadImageFile, destroyAsset } from '../utils/cloudinary.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(requireAuth)   // the letterpad is admin-only

const clean = stripHtml
const PAGE_KEY = 'letterhead'

const DEFAULT_HEAD = {
  companyName: 'Kartik Painter Services',
  tagline: 'Interior · Exterior · Waterproofing · Texture',
  logoUrl: '/logo.png',
  logoPublicId: '',
  website: 'www.kartikpainterservices.com',
  phone: '',
  altPhone: '',
  email: '',
  address: '',
  gst: '',
  instagram: '',
  facebook: '',
  youtube: '',
  accentColor: '#E07A3A',
  footerNote: '',
  quotePrefix: 'KPS',

  // A ready-made A4 letterhead printed as the page background. Documents then
  // type inside the blank area, so the design is exactly what the designer made.
  useSheet: true,
  sheetImageUrl: '/letterhead.jpg',
  sheetImagePublicId: '',
  sheetTop: 60,      // mm from the top edge — below the header rule
  sheetBottom: 65,   // mm from the bottom edge — above the signature block
  sheetLeft: 18,
  sheetRight: 18,
  sheetHasSignature: true,   // the design already prints "Authorised Signature"
}

async function readHead() {
  const doc = await SiteContent.findOne({ pageKey: PAGE_KEY })
  return { ...DEFAULT_HEAD, ...(doc?.sections || {}) }
}

/* ── Letterhead settings (logo, contact strip) ── */
router.get('/settings', asyncHandler(async (req, res) => {
  res.json(await readHead())
}))

const headSchema = z.object({
  companyName: z.string().trim().max(120).optional(),
  tagline:     z.string().trim().max(160).optional(),
  logoUrl:     z.string().trim().max(500).optional(),
  website:     z.string().trim().max(160).optional(),
  phone:       z.string().trim().max(40).optional(),
  altPhone:    z.string().trim().max(40).optional(),
  email:       z.string().trim().max(120).optional(),
  address:     z.string().trim().max(300).optional(),
  gst:         z.string().trim().max(60).optional(),
  instagram:   z.string().trim().max(160).optional(),
  facebook:    z.string().trim().max(160).optional(),
  youtube:     z.string().trim().max(160).optional(),
  accentColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  footerNote:  z.string().trim().max(300).optional(),
  quotePrefix: z.string().trim().max(12).optional(),

  useSheet:      z.boolean().optional(),
  sheetImageUrl: z.string().trim().max(500).optional(),
  sheetTop:      z.coerce.number().min(0).max(200).optional(),
  sheetBottom:   z.coerce.number().min(0).max(200).optional(),
  sheetLeft:     z.coerce.number().min(0).max(100).optional(),
  sheetRight:    z.coerce.number().min(0).max(100).optional(),
  sheetHasSignature: z.boolean().optional(),
})

const RAW_KEYS = new Set([
  'accentColor', 'logoUrl', 'sheetImageUrl', 'useSheet', 'sheetHasSignature',
  'sheetTop', 'sheetBottom', 'sheetLeft', 'sheetRight',
])

router.put('/settings', asyncHandler(async (req, res) => {
  const parsed = headSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid letterhead details', details: parsed.error.flatten() })

  const current = await readHead()
  const next = { ...current }
  for (const [key, value] of Object.entries(parsed.data)) {
    next[key] = RAW_KEYS.has(key) ? value : clean(value)
  }

  await SiteContent.findOneAndUpdate(
    { pageKey: PAGE_KEY },
    { $set: { sections: next, updatedBy: req.admin.id } },
    { upsert: true, new: true },
  )

  await logActivity('update', 'Letterhead', PAGE_KEY, req.admin.id)
  res.json(next)
}))

router.post('/settings/logo', handleUpload, asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' })

  const current = await readHead()
  const result = await uploadImageFile(req.file, 'kartik/letterhead')
  if (current.logoPublicId) await destroyAsset(current.logoPublicId)

  const next = { ...current, logoUrl: result.secure_url, logoPublicId: result.public_id }
  await SiteContent.findOneAndUpdate(
    { pageKey: PAGE_KEY },
    { $set: { sections: next, updatedBy: req.admin.id } },
    { upsert: true },
  )

  res.json(next)
}))

router.post('/settings/sheet', handleUpload, asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' })

  const current = await readHead()
  const result = await uploadImageFile(req.file, 'kartik/letterhead')
  if (current.sheetImagePublicId) await destroyAsset(current.sheetImagePublicId)

  const next = {
    ...current,
    sheetImageUrl: result.secure_url,
    sheetImagePublicId: result.public_id,
    useSheet: true,
  }
  await SiteContent.findOneAndUpdate(
    { pageKey: PAGE_KEY },
    { $set: { sections: next, updatedBy: req.admin.id } },
    { upsert: true },
  )

  await logActivity('update', 'Letterhead', 'sheet', req.admin.id)
  res.json(next)
}))

/* ── Saved letters ── */
const letterSchema = z.object({
  title:      z.string().trim().max(160).optional(),
  refNo:      z.string().trim().max(60).optional(),
  letterDate: z.string().trim().max(20).optional(),
  toName:     z.string().trim().max(160).optional(),
  toAddress:  z.string().trim().max(500).optional(),
  subject:    z.string().trim().max(300).optional(),
  salutation: z.string().trim().max(80).optional(),
  body:       z.string().max(20000).optional(),
  closing:    z.string().trim().max(80).optional(),
  signName:   z.string().trim().max(120).optional(),
  signTitle:  z.string().trim().max(120).optional(),
})

const cleanLetter = (data) => {
  const out = {}
  for (const [key, value] of Object.entries(data)) out[key] = clean(value)
  return out
}

router.get('/', asyncHandler(async (req, res) => {
  const letters = await Letter.find().sort({ updatedAt: -1 }).limit(100)
  res.json(letters)
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const letter = await Letter.findById(req.params.id)
  if (!letter) return res.status(404).json({ error: 'Letter not found' })
  res.json(letter)
}))

router.post('/', asyncHandler(async (req, res) => {
  const parsed = letterSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid letter' })

  const letter = await Letter.create({ ...cleanLetter(parsed.data), createdBy: req.admin.id })
  await logActivity('create', 'Letter', letter._id, req.admin.id)
  res.status(201).json(letter)
}))

router.put('/:id', asyncHandler(async (req, res) => {
  const parsed = letterSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid letter' })

  const letter = await Letter.findByIdAndUpdate(
    req.params.id,
    { $set: cleanLetter(parsed.data) },
    { new: true },
  )
  if (!letter) return res.status(404).json({ error: 'Letter not found' })

  await logActivity('update', 'Letter', letter._id, req.admin.id)
  res.json(letter)
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  const letter = await Letter.findByIdAndDelete(req.params.id)
  if (!letter) return res.status(404).json({ error: 'Letter not found' })
  await logActivity('delete', 'Letter', req.params.id, req.admin.id)
  res.json({ ok: true })
}))

export default router
