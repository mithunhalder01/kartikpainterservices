import { verifyAccessToken } from '../utils/tokens.js'

function readToken(req) {
  const token = req.cookies?.accessToken
  if (!token) return null
  try {
    return verifyAccessToken(token)
  } catch {
    return null
  }
}

// Admin-only. Every existing content/lead route relies on this and on `req.admin`.
export function requireAuth(req, res, next) {
  if (!req.cookies?.accessToken) return res.status(401).json({ error: 'Not authenticated' })

  const payload = readToken(req)
  if (!payload) return res.status(401).json({ error: 'Session expired' })
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  req.admin = { id: payload.sub }
  req.user = { id: payload.sub, role: 'admin' }
  next()
}

// Admin *or* labour. Used by the read-only attendance endpoints; handlers must
// scope their own data by `req.user.role`.
export function requireUser(req, res, next) {
  if (!req.cookies?.accessToken) return res.status(401).json({ error: 'Not authenticated' })

  const payload = readToken(req)
  if (!payload) return res.status(401).json({ error: 'Session expired' })
  if (payload.role !== 'admin' && payload.role !== 'labour') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  req.user = { id: payload.sub, role: payload.role }
  if (payload.role === 'admin') req.admin = { id: payload.sub }
  next()
}

// Guard for write endpoints sitting behind `requireUser`.
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
  next()
}
