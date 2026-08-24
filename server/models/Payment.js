import mongoose from 'mongoose'

export const PAY_MODES = ['Cash', 'UPI', 'Bank', 'Cheque', 'Other']

// Money received from a customer against one approved quotation.
const paymentSchema = new mongoose.Schema({
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true, index: true },
  date:      { type: Date, required: true },
  amount:    { type: Number, required: true, min: 1 },
  mode:      { type: String, enum: PAY_MODES, default: 'Cash' },
  reference: { type: String, default: '', trim: true },   // UPI ref / cheque no.
  note:      { type: String, default: '', trim: true },
  recordedBy:{ type: String, default: '' },
}, { timestamps: true })

paymentSchema.index({ date: -1 })

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema)
