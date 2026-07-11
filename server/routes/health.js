import { Router } from 'express'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    await connectDB()
    res.json({
      ok: true,
      db: mongoose.connection.readyState === 1 ? 'connected' : 'not-connected',
      time: new Date().toISOString(),
    })
  } catch (err) {
    res.status(503).json({ ok: false, error: 'Database connection failed' })
  }
})

export default router
