import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { sanitizeRequest } from './middleware/sanitize.js'
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import galleryRoutes, { galleryAdminRouter } from './routes/gallery.js'
import categoriesRoutes from './routes/categories.js'
import servicesRoutes, { servicesAdminRouter } from './routes/services.js'
import testimonialsRoutes, { testimonialsAdminRouter } from './routes/testimonials.js'
import aboutRoutes, { aboutAdminRouter } from './routes/about.js'
import homeRoutes, { homeAdminRouter } from './routes/home.js'
import leadsRoutes, { leadsAdminRouter } from './routes/leads.js'
import dashboardRoutes from './routes/dashboard.js'
import settingsRoutes from './routes/settings.js'

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    // allow same-origin/non-browser requests (no Origin header) and configured origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(sanitizeRequest)

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/testimonials', testimonialsRoutes)
app.use('/api/about', aboutRoutes)
app.use('/api/home', homeRoutes)
app.use('/api/leads', leadsRoutes)

app.use('/api/admin/gallery', galleryAdminRouter)
app.use('/api/admin/categories', categoriesRoutes)
app.use('/api/admin/services', servicesAdminRouter)
app.use('/api/admin/testimonials', testimonialsAdminRouter)
app.use('/api/admin/about', aboutAdminRouter)
app.use('/api/admin/home', homeAdminRouter)
app.use('/api/admin/leads', leadsAdminRouter)
app.use('/api/admin/dashboard', dashboardRoutes)
app.use('/api/admin/settings', settingsRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
