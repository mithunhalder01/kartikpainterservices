import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'

async function seed() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env

  if (!MONGODB_URI) throw new Error('MONGODB_URI is not set')
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding')
  }
  if (ADMIN_PASSWORD.length < 10) {
    throw new Error('ADMIN_PASSWORD should be at least 10 characters long')
  }

  await mongoose.connect(MONGODB_URI)

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
  const email = ADMIN_EMAIL.toLowerCase().trim()

  const existing = await Admin.findOne({ email })
  if (existing) {
    existing.passwordHash = passwordHash
    existing.name = ADMIN_NAME || existing.name || 'Admin'
    await existing.save()
    console.log(`Updated existing admin: ${email}`)
  } else {
    await Admin.create({ email, passwordHash, name: ADMIN_NAME || 'Admin' })
    console.log(`Created admin: ${email}`)
  }

  await mongoose.disconnect()
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exit(1)
  })
