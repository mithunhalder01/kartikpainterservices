import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, required: true, trim: true },
  lastLoginAt:  { type: Date },
  refreshTokenHash: { type: String, default: null },
}, { timestamps: true })

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema)
