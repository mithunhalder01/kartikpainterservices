import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import Admin from '../models/Admin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { loginLimiter } from '../middleware/rateLimiters.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { logActivity } from '../utils/activityLog.js'
import {
  signAccessToken, signRefreshToken, verifyRefreshToken, hashToken,
  accessCookieOptions, refreshCookieOptions,
} from '../utils/tokens.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid email or password format' })
  const { email, password } = parsed.data

  const admin = await Admin.findOne({ email: email.toLowerCase() })
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const accessToken = signAccessToken(admin)
  const { token: refreshToken, jti } = signRefreshToken(admin)

  admin.refreshTokenHash = hashToken(jti)
  admin.lastLoginAt = new Date()
  await admin.save()

  res.cookie('accessToken', accessToken, accessCookieOptions)
  res.cookie('refreshToken', refreshToken, refreshCookieOptions)

  await logActivity('login', 'Admin', admin._id, admin.email)

  res.json({ name: admin.name, email: admin.email })
}))

router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    res.clearCookie('accessToken', accessCookieOptions)
    res.clearCookie('refreshToken', refreshCookieOptions)
    return res.status(401).json({ error: 'Session expired' })
  }

  const admin = await Admin.findById(payload.sub)
  if (!admin || admin.refreshTokenHash !== hashToken(payload.jti)) {
    res.clearCookie('accessToken', accessCookieOptions)
    res.clearCookie('refreshToken', refreshCookieOptions)
    return res.status(401).json({ error: 'Session expired' })
  }

  const accessToken = signAccessToken(admin)
  const { token: newRefreshToken, jti } = signRefreshToken(admin)
  admin.refreshTokenHash = hashToken(jti)
  await admin.save()

  res.cookie('accessToken', accessToken, accessCookieOptions)
  res.cookie('refreshToken', newRefreshToken, refreshCookieOptions)

  res.json({ ok: true })
}))

router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) {
    try {
      const payload = verifyRefreshToken(token)
      await Admin.findByIdAndUpdate(payload.sub, { refreshTokenHash: null })
    } catch {
      // token already invalid — nothing to clean up
    }
  }
  res.clearCookie('accessToken', accessCookieOptions)
  res.clearCookie('refreshToken', refreshCookieOptions)
  res.json({ ok: true })
}))

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('name email lastLoginAt')
  if (!admin) return res.status(401).json({ error: 'Not authenticated' })
  res.json({ name: admin.name, email: admin.email, lastLoginAt: admin.lastLoginAt })
}))

export default router
