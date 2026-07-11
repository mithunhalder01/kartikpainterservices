import mongoose from 'mongoose'

const galleryImageSchema = new mongoose.Schema({
  imageUrl:     { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  category:     { type: String, required: true, trim: true },
  label:        { type: String, trim: true, default: '' },
  order:        { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  updatedBy:    { type: String, default: '' },
}, { timestamps: true })

galleryImageSchema.index({ category: 1, order: 1 })

export default mongoose.models.GalleryImage || mongoose.model('GalleryImage', galleryImageSchema)
