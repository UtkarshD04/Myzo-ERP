import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  title: String,
  message: String,
  time: String,
  read: { type: Boolean, default: false },
  category: String
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);

// Temporary product switch: the notification feature is paused, so new
// notifications are skipped at this single choke point rather than at each
// of the ~9 call sites that create them. Flip back to 'true' (or unset) to
// re-enable — no other code needs to change.
const NOTIFICATIONS_ENABLED = process.env.NOTIFICATIONS_ENABLED !== 'false';

export async function findAllNotifications() {
  return Notification.find({}).sort({ createdAt: -1 }).lean();
}

export async function addNotification(notification) {
  if (NOTIFICATIONS_ENABLED) {
    await Notification.create(notification);
  }
  return findAllNotifications();
}

export async function markNotificationsRead() {
  await Notification.updateMany({}, { read: true });
  return findAllNotifications();
}

export async function markNotificationRead(id) {
  await Notification.findOneAndUpdate({ id }, { read: true });
  return findAllNotifications();
}

export async function removeNotification(id) {
  await Notification.deleteOne({ id });
  return findAllNotifications();
}
