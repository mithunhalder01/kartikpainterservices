import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import Admin from '../models/Admin.js'
import Labour from '../models/Labour.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { loginLimiter } from '../middleware/rateLimiters.js'
import { requireUser } from '../middleware/requireAuth.js'
import { logActivity } from '../utils/activityLog.js'
import {
  signAccessToken, signRefreshToken, verifyRefreshToken, hashToken,
  accessCookieOptions, refreshCookieOptions,
} from '../utils/tokens.js'

const router = Router()

const loginSchema = z.object({
  // admins sign in with an email, labour with a phone number
  identifier: z.string().trim().min(3).max(120).optional(),
  email: z.string().trim().min(3).max(120).optional(),
  password: z.string().min(1),
})

const digitsOnly = (v) => v.replace(/\D/g, '')
const looksLikeEmail = (v) => v.includes('@')

function issueSession(res, principal, role) {
  const accessToken = signAccessToken(principal, role)
  const { token: refreshToken, jti } = signRefreshToken(principal, role)
  res.cookie('accessToken', accessToken, accessCookieOptions)
  res.cookie('refreshToken', refreshToken, refreshCookieOptions)
  return jti
}

const publicAdmin = (a) => ({ role: 'admin', name: a.name, email: a.email, lastLoginAt: a.lastLoginAt })
const publicLabour = (l) => ({
  role: 'labour', id: l._id, name: l.name, phone: l.phone,
  designation: l.designation, status: l.status, lastLoginAt: l.lastLoginAt,
})

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid login details' })

  const raw = (parsed.data.identifier || parsed.data.email || '').trim()
  const { password } = parsed.data
  if (!raw) return res.status(400).json({ error: 'Invalid login details' })

  if (looksLikeEmail(raw)) {
    const admin = await Admin.findOne({ email: raw.toLowerCase() })
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' })
    if (!(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const jti = issueSession(res, admin, 'admin')
    admin.refreshTokenHash = hashToken(jti)
    admin.lastLoginAt = new Date()
    await admin.save()

    await logActivity('login', 'Admin', admin._id, admin.email)
    return res.json(publicAdmin(admin))
  }

  const phone = digitsOnly(raw)
  const labour = phone ? await Labour.findOne({ phone }) : null
  if (!labour || !labour.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })
  if (!(await bcrypt.compare(password, labour.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  if (labour.status === 'blocked') {
    return res.status(403).json({ error: 'Your account has been blocked. Please contact the admin.' })
  }
  if (!labour.canLogin) {
    return res.status(403).json({ error: 'Login is not enabled for your account. Please contact the admin.' })
  }

  const jti = issueSession(res, labour, 'labour')
  labour.refreshTokenHash = hashToken(jti)
  labour.lastLoginAt = new Date()
  await labour.save()

  await logActivity('login', 'Labour', labour._id, labour.phone)
  res.json(publicLabour(labour))
}))

function clearSession(res) {
  res.clearCookie('accessToken', accessCookieOptions)
  res.clearCookie('refreshToken', refreshCookieOptions)
}

router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    clearSession(res)
    return res.status(401).json({ error: 'Session expired' })
  }

  const role = payload.role === 'labour' ? 'labour' : 'admin'
  const Model = role === 'labour' ? Labour : Admin
  const principal = await Model.findById(payload.sub)

  if (!principal || principal.refreshTokenHash !== hashToken(payload.jti)) {
    clearSession(res)
    return res.status(401).json({ error: 'Session expired' })
  }
  if (role === 'labour' && (principal.status === 'blocked' || !principal.canLogin)) {
    principal.refreshTokenHash = null
    await principal.save()
    clearSession(res)
    return res.status(403).json({ error: 'Access revoked' })
  }

  const jti = issueSession(res, principal, role)
  principal.refreshTokenHash = hashToken(jti)
  await principal.save()

  res.json({ ok: true })
}))

router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) {
    try {
      const payload = verifyRefreshToken(token)
      const Model = payload.role === 'labour' ? Labour : Admin
      await Model.findByIdAndUpdate(payload.sub, { refreshTokenHash: null })
    } catch {
      // token already invalid — nothing to clean up
    }
  }
  clearSession(res)
  res.json({ ok: true })
}))

router.get('/me', requireUser, asyncHandler(async (req, res) => {
  if (req.user.role === 'labour') {
    const labour = await Labour.findById(req.user.id)
    if (!labour || labour.status === 'blocked' || !labour.canLogin) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    return res.json(publicLabour(labour))
  }

  const admin = await Admin.findById(req.user.id).select('name email lastLoginAt')
  if (!admin) return res.status(401).json({ error: 'Not authenticated' })
  res.json(publicAdmin(admin))
}))

export default router
