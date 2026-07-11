import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  slug:         { type: String, required: true, unique: true, trim: true },
  iconName:     { type: String, default: 'Layers' },
  title:        { type: String, required: true, trim: true },
  shortDesc:    { type: String, trim: true, default: '' },
  desc:         { type: String, trim: true, default: '' },
  longDesc:     { type: String, trim: true, default: '' },
  price:        { type: String, trim: true, default: '' },
  image:        { type: String, default: '' },
  cloudinaryId: { type: String, default: '' },
  seoTitle:     { type: String, trim: true, default: '' },
  seoDesc:      { type: String, trim: true, default: '' },
  seoKeywords:  { type: String, trim: true, default: '' },
  features:     { type: [String], default: [] },
  areas:        { type: [String], default: [] },
  order:        { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  updatedBy:    { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.Service || mongoose.model('Service', serviceSchema)
