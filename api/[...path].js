import 'dotenv/config'
import app from '../server/app.js'
import { connectDB } from '../server/config/db.js'

export default async function handler(req, res) {
  try {
    await connectDB()
  } catch (err) {
    console.error('DB connection failed:', err.message)
    res.status(503).json({ error: 'Service temporarily unavailable' })
    return
  }
  app(req, res)
}
