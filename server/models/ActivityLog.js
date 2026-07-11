import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema({
  action:     { type: String, required: true },
  entityType: { type: String, required: true },
  entityId:   { type: String, default: '' },
  actor:      { type: String, default: '' },
  timestamp:  { type: Date, default: Date.now },
})

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema)
