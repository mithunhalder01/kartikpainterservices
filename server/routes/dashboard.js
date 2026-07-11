import { Router } from 'express'
import Lead from '../models/Lead.js'
import GalleryImage from '../models/GalleryImage.js'
import Testimonial from '../models/Testimonial.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

router.get('/stats', asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [newLeadsThisWeek, totalLeads, byStatus, galleryCount, testimonialCount, recentLeads] = await Promise.all([
    Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
    Lead.countDocuments(),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    GalleryImage.countDocuments(),
    Testimonial.countDocuments(),
    Lead.find().sort({ createdAt: -1 }).limit(5),
  ])

  const statusCounts = byStatus.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {})

  res.json({
    newLeadsThisWeek,
    totalLeads,
    statusCounts,
    galleryCount,
    testimonialCount,
    recentLeads,
  })
}))

router.get('/notifications', asyncHandler(async (req, res) => {
  const [count, latest] = await Promise.all([
    Lead.countDocuments({ status: 'New' }),
    Lead.find({ status: 'New' }).sort({ createdAt: -1 }).limit(5).select('name phone createdAt serviceInterested'),
  ])
  res.json({ count, latest })
}))

export default router
