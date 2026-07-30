import {
  markNotificationRead,
  markNotificationsRead,
  removeNotification
} from '../models/notificationModel.js';
import { requireRole } from '../middleware/auth.js';

// Notifications are a single company-wide feed (no per-user field), so
// marking everything read or deleting an entry affects every employee's
// view at once — not just the caller's. Restrict those two to the roles
// that own this feed; any employee can still view it and mark one item
// they've personally seen as read.
const NOTIFICATION_ADMIN_ROLES = ['Admin', 'HR'];

export async function markAllRead(req, res) {
  requireRole(req, ...NOTIFICATION_ADMIN_ROLES);
  const notifications = await markNotificationsRead();
  res.json({ notifications });
}

export async function markOneRead(req, res) {
  const notifications = await markNotificationRead(req.params.id);
  res.json({ notifications });
}

export async function deleteOne(req, res) {
  requireRole(req, ...NOTIFICATION_ADMIN_ROLES);
  const notifications = await removeNotification(req.params.id);
  res.json({ notifications });
}
