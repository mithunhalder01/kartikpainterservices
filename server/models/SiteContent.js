import mongoose from 'mongoose'

// One flexible document per page (pageKey: 'about', etc). `sections` holds
// whatever shape that page's editor needs, so new pages/fields don't need new schemas.
const siteContentSchema = new mongoose.Schema({
  pageKey:   { type: String, required: true, unique: true, trim: true },
  sections:  { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedBy: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.SiteContent || mongoose.model('SiteContent', siteContentSchema)
