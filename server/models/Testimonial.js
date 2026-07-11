import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  location: { type: String, trim: true, default: '' },
  stars:    { type: Number, required: true, min: 1, max: 5 },
  text:     { type: String, required: true, trim: true },
  photoUrl: { type: String, default: '' },
  cloudinaryId: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
  updatedBy: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema)
