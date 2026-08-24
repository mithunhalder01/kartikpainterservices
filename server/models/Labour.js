import mongoose from 'mongoose'

// Workers on the crew. They may optionally be given a login (phone + password),
// which grants a read-only view of their own attendance — never the admin panel.
const labourSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  phone:       { type: String, required: true, unique: true, trim: true },
  altPhone:    { type: String, default: '', trim: true },
  designation: { type: String, default: 'Painter', trim: true },
  dailyWage:   { type: Number, default: 0, min: 0 },
  joinedOn:    { type: Date, default: Date.now },
  address:     { type: String, default: '', trim: true },
  idProof:     { type: String, default: '', trim: true },
  photoUrl:    { type: String, default: '' },
  photoPublicId: { type: String, default: '' },
  notes:       { type: String, default: '' },

  // active  → works today, shows in attendance sheet
  // inactive→ not currently working, hidden from the sheet, history kept
  // blocked → cannot log in at all, hidden from the sheet
  status:      { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },

  canLogin:         { type: Boolean, default: false },
  passwordHash:     { type: String, default: null },
  refreshTokenHash: { type: String, default: null },
  lastLoginAt:      { type: Date },
  createdBy:        { type: String, default: '' },
}, { timestamps: true })

labourSchema.index({ status: 1, name: 1 })

export default mongoose.models.Labour || mongoose.model('Labour', labourSchema)
