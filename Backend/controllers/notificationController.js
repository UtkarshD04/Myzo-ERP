import {
  markNotificationRead,
  markNotificationsRead,
  removeNotification
} from '../models/notificationModel.js';

export async function markAllRead(req, res) {
  const db = await markNotificationsRead();
  res.json(db);
}

export async function markOneRead(req, res) {
  const db = await markNotificationRead(req.params.id);
  res.json(db);
}

export async function deleteOne(req, res) {
  const db = await removeNotification(req.params.id);
  res.json(db);
}
