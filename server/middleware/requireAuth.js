import { verifyAccessToken } from '../utils/tokens.js'

export function requireAuth(req, res, next) {
  const token = req.cookies?.accessToken
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const payload = verifyAccessToken(token)
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    req.admin = { id: payload.sub }
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired' })
  }
}
