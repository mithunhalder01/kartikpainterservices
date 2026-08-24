import mongoose from 'mongoose'

export const LABOUR_ENTRY_TYPES = ['advance', 'payment', 'bonus', 'deduction']
export const PAY_MODES = ['Cash', 'UPI', 'Bank', 'Cheque', 'Other']

// Money moving between the contractor and one worker. Wages *earned* come from
// the attendance register; this records only what has actually been handed over,
// so the balance is always (earned − paid) rather than a number someone typed.
const labourPaymentSchema = new mongoose.Schema({
  labour: { type: mongoose.Schema.Types.ObjectId, ref: 'Labour', required: true, index: true },
  date:   { type: Date, required: true },
  amount: { type: Number, required: true, min: 1 },

  // advance/payment reduce what is owed; bonus increases it; deduction reduces it
  type:   { type: String, enum: LABOUR_ENTRY_TYPES, default: 'payment' },
  mode:   { type: String, enum: PAY_MODES, default: 'Cash' },
  note:   { type: String, default: '', trim: true },
  paidBy: { type: String, default: '' },
}, { timestamps: true })

labourPaymentSchema.index({ date: -1 })

export default mongoose.models.LabourPayment || mongoose.model('LabourPayment', labourPaymentSchema)
