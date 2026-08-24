import mongoose from 'mongoose'

// A saved letterpad document. Rendering (A4 preview + PDF) happens on the client;
// this only stores what the admin typed so a letter can be reopened and reprinted.
const letterSchema = new mongoose.Schema({
  title:      { type: String, default: 'Untitled Letter', trim: true },
  refNo:      { type: String, default: '', trim: true },
  letterDate: { type: String, default: '' },   // ISO yyyy-mm-dd, kept as typed
  toName:     { type: String, default: '', trim: true },
  toAddress:  { type: String, default: '' },
  subject:    { type: String, default: '', trim: true },
  salutation: { type: String, default: 'Dear Sir/Madam,', trim: true },
  body:       { type: String, default: '' },
  closing:    { type: String, default: 'Yours faithfully,', trim: true },
  signName:   { type: String, default: '', trim: true },
  signTitle:  { type: String, default: '', trim: true },
  createdBy:  { type: String, default: '' },
}, { timestamps: true })

letterSchema.index({ updatedAt: -1 })

export default mongoose.models.Letter || mongoose.model('Letter', letterSchema)
