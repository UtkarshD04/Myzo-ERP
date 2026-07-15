import { updateDb } from '../db/fileDb.js';

export async function addNotification(notification) {
  return updateDb((db) => ({
    ...db,
    notifications: [notification, ...db.notifications]
  }));
}

export async function markNotificationsRead() {
  return updateDb((db) => ({
    ...db,
    notifications: db.notifications.map((notification) => ({ ...notification, read: true }))
  }));
}

export async function markNotificationRead(id) {
  return updateDb((db) => ({
    ...db,
    notifications: db.notifications.map((notification) => (
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }));
}

export async function removeNotification(id) {
  return updateDb((db) => ({
    ...db,
    notifications: db.notifications.filter((notification) => notification.id !== id)
  }));
}
