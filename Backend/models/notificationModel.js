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

export async function findAllNotifications() {
  return Notification.find({}).sort({ createdAt: -1 }).lean();
}

export async function addNotification(notification) {
  await Notification.create(notification);
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
