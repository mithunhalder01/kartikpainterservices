import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const ACCESS_TTL  = '15m'
const REFRESH_TTL = '30d'
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function signAccessToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), role: 'admin' }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL })
}

export function signRefreshToken(admin) {
  const jti = crypto.randomBytes(24).toString('hex')
  const token = jwt.sign({ sub: admin._id.toString(), jti }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL })
  return { token, jti }
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const isProd = process.env.NODE_ENV === 'production'

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict',
  path: '/',
  maxAge: 15 * 60 * 1000,
}

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: REFRESH_TTL_MS,
}
