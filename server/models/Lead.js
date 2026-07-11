import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  text:      { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true })

const leadSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  phone:             { type: String, required: true, trim: true },
  email:             { type: String, trim: true, default: '' },
  message:           { type: String, trim: true, default: '' },
  serviceInterested: { type: String, trim: true, default: '' },
  area:              { type: String, trim: true, default: '' },
  source:            { type: String, trim: true, default: 'Contact Form' },
  status:            { type: String, enum: ['New', 'Contacted', 'Quoted', 'Won', 'Lost'], default: 'New' },
  notes:             { type: [noteSchema], default: [] },
}, { timestamps: true })

leadSchema.index({ status: 1, createdAt: -1 })
leadSchema.index({ name: 'text', phone: 'text', email: 'text' })

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema)
