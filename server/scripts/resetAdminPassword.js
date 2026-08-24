import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'

// Locked out? Run this against the database to set a new password.
//   1. `node server/scripts/resetAdminPassword.js`            → lists the admin emails
//   2. add ADMIN_EMAIL + ADMIN_PASSWORD to .env, run it again → resets that account
async function run() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not set in .env')

  await mongoose.connect(MONGODB_URI)

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    const admins = await Admin.find().select('name email lastLoginAt').sort({ createdAt: 1 })
    if (!admins.length) {
      console.log('No admin accounts exist yet — run `npm run seed:admin` to create the first one.')
    } else {
      console.log(`\n${admins.length} admin account(s) in this database:\n`)
      admins.forEach((a) => {
        const seen = a.lastLoginAt ? a.lastLoginAt.toISOString().slice(0, 10) : 'never'
        console.log(`  • ${a.email}   (${a.name}, last login: ${seen})`)
      })
      console.log('\nNow set ADMIN_EMAIL and ADMIN_PASSWORD in .env and run this again.\n')
    }
    await mongoose.disconnect()
    return
  }

  if (ADMIN_PASSWORD.length < 10) throw new Error('ADMIN_PASSWORD should be at least 10 characters long')

  const email = ADMIN_EMAIL.toLowerCase().trim()
  const admin = await Admin.findOne({ email })
  if (!admin) {
    throw new Error(`No admin found with email "${email}". Run without ADMIN_EMAIL to list the real ones.`)
  }

  admin.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
  admin.refreshTokenHash = null   // sign out every existing session
  await admin.save()

  console.log(`Password reset for ${email}. You can log in with the new password now.`)
  await mongoose.disconnect()
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Reset failed:', err.message)
    process.exit(1)
  })
