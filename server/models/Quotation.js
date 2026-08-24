import mongoose from 'mongoose'

export const QUOTE_STATUSES = ['Draft', 'Sent', 'Approved', 'Rejected', 'Completed']
export const UNITS = ['sq.ft', 'nos', 'ltr', 'kg', 'day', 'job']
export const ITEM_KINDS = ['work', 'material', 'labour']

// A line on the customer-facing quotation. `kind` lets a contractor split a job
// into separate material and labour lines when the customer asks for it; the
// default 'work' is a single all-inclusive rate, which is how most quotes read.
const itemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  section:     { type: String, default: '', trim: true },   // e.g. "Interior", "Extra work"
  kind:        { type: String, enum: ITEM_KINDS, default: 'work' },
  unit:        { type: String, default: 'sq.ft', trim: true },
  qty:         { type: Number, default: 0, min: 0 },
  rate:        { type: Number, default: 0, min: 0 },
}, { _id: false })

// An approved quotation doubles as the job ledger — payments hang off it, so the
// amount owed never has to be typed in a second place.
const quotationSchema = new mongoose.Schema({
  serial:     { type: Number, required: true },
  fy:         { type: String, required: true },   // Indian financial year, "2026-27"
  quoteNo:    { type: String, required: true, unique: true, trim: true },
  quoteDate:  { type: String, default: '' },      // ISO yyyy-mm-dd, kept as typed
  validDays:  { type: Number, default: 15, min: 0, max: 365 },

  customerName:    { type: String, required: true, trim: true },
  customerPhone:   { type: String, default: '', trim: true },
  customerEmail:   { type: String, default: '', trim: true },
  customerAddress: { type: String, default: '' },
  lead:            { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },

  title: { type: String, default: '', trim: true },   // "Interior painting — 3BHK"
  items: { type: [itemSchema], default: [] },

  discount:      { type: Number, default: 0, min: 0 },
  discountIsPct: { type: Boolean, default: false },
  gstPercent:    { type: Number, default: 0, min: 0, max: 28 },

  // internal only — never printed; drives the profit figure on the job
  materialCost: { type: Number, default: 0, min: 0 },
  otherCost:    { type: Number, default: 0, min: 0 },

  terms:     { type: String, default: '' },
  notes:     { type: String, default: '' },
  signName:  { type: String, default: '', trim: true },
  signTitle: { type: String, default: '', trim: true },

  status:     { type: String, enum: QUOTE_STATUSES, default: 'Draft' },
  approvedAt: { type: Date, default: null },
  createdBy:  { type: String, default: '' },
}, { timestamps: true })

quotationSchema.index({ status: 1, createdAt: -1 })
quotationSchema.index({ customerPhone: 1 })
quotationSchema.index({ fy: 1, serial: -1 })

export default mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema)
