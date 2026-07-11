import ActivityLog from '../models/ActivityLog.js'

export async function logActivity(action, entityType, entityId = '', actor = '') {
  try {
    await ActivityLog.create({ action, entityType, entityId: String(entityId), actor })
  } catch {
    // logging failures must never break the actual request
  }
}
