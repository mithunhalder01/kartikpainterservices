import mongoose from 'mongoose'

export const STATUSES = ['P', 'H', 'A']          // Present · Half Day · Absent
export const DAY_VALUE = { P: 1, H: 0.5, A: 0 }  // days credited towards wages

// One document per labour per day. `date` is always normalised to UTC midnight
// so the unique index can never be defeated by a stray timezone offset.
const attendanceSchema = new mongoose.Schema({
  labour:       { type: mongoose.Schema.Types.ObjectId, ref: 'Labour', required: true, index: true },
  date:         { type: Date, required: true },
  status:       { type: String, enum: STATUSES, required: true },
  overtimeHours:{ type: Number, default: 0, min: 0, max: 24 },
  site:         { type: String, default: '', trim: true },
  note:         { type: String, default: '', trim: true },
  markedBy:     { type: String, default: '' },
  markedByName: { type: String, default: '' },
}, { timestamps: true })

attendanceSchema.index({ labour: 1, date: 1 }, { unique: true })
attendanceSchema.index({ date: 1 })

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema)
