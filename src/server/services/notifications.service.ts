import { notificationRepository } from '../repositories/notifications.repository';
import { Notification, User } from '../types';

export async function getVisibleNotifications(currentUser: Pick<User, 'id' | 'role'>): Promise<Notification[]> {
  return notificationRepository.findVisible(currentUser);
}

export async function createNotification(data: Pick<Notification, 'user_id' | 'title' | 'message'>): Promise<Notification> {
  if (!data.user_id || !data.title || !data.message) {
    throw new Error('Missing required fields for notification');
  }

  return notificationRepository.create({
    user_id: data.user_id,
    title: data.title.trim(),
    message: data.message.trim(),
  });
}

export async function markNotificationsAsRead(currentUser: Pick<User, 'id'>): Promise<void> {
  await notificationRepository.markAllAsRead(currentUser.id);
}
