import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'

// TEMPORARY RECOVERY ACCOUNT.
// These credentials are committed to a public repository, so anyone can read them.
// Use this account once to get back into the panel, reset the real admin password
// from Settings, then delete this account (Settings → Admins → trash icon).
const EMAIL = process.env.DUMMY_ADMIN_EMAIL || 'admin@admin.com'
const PASSWORD = process.env.DUMMY_ADMIN_PASSWORD || 'admin123'
const NAME = process.env.DUMMY_ADMIN_NAME || 'Temp Admin'

async function run() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set in .env')

  await mongoose.connect(process.env.MONGODB_URI)

  const email = EMAIL.toLowerCase().trim()
  const passwordHash = await bcrypt.hash(PASSWORD, 12)

  const existing = await Admin.findOne({ email })
  if (existing) {
    existing.passwordHash = passwordHash
    existing.refreshTokenHash = null
    await existing.save()
    console.log(`\nUpdated the temporary admin: ${email}`)
  } else {
    await Admin.create({ email, passwordHash, name: NAME })
    console.log(`\nCreated the temporary admin: ${email}`)
  }

  console.log(`Password: ${PASSWORD}`)
  console.log('\n  !!  This password is public. As soon as you are signed in:')
  console.log('  1. Settings → Admins → key icon next to your real account → set a new password')
  console.log('  2. Settings → Admins → trash icon next to "%s" → delete it\n', email)

  await mongoose.disconnect()
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed:', err.message)
    process.exit(1)
  })
