import {
  markNotificationRead,
  markNotificationsRead,
  removeNotification
} from '../models/notificationModel.js';

export async function markAllRead(req, res) {
  const notifications = await markNotificationsRead();
  res.json({ notifications });
}

export async function markOneRead(req, res) {
  const notifications = await markNotificationRead(req.params.id);
  res.json({ notifications });
}

export async function deleteOne(req, res) {
  const notifications = await removeNotification(req.params.id);
  res.json({ notifications });
}
