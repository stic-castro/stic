import { notificationRepository } from '../repositories/notifications.repository';
import { Notification, User } from '../types';

export async function getVisibleNotifications(currentUser: Pick<User, 'id' | 'role'>): Promise<Notification[]> {
  return notificationRepository.findVisible(currentUser);
}

export async function createNotification(
  data: Pick<Notification, 'user_id' | 'title' | 'message' | 'job_id'>
): Promise<Notification> {
  if (!data.user_id || !data.title || !data.message) {
    throw new Error('Missing required fields for notification');
  }

  return notificationRepository.create({
    user_id: data.user_id,
    job_id: data.job_id ?? null,
    title: data.title.trim(),
    message: data.message.trim(),
  });
}

export async function markNotificationsAsRead(
  currentUser: Pick<User, 'id'>,
  notificationIds?: string[]
): Promise<void> {
  await notificationRepository.markAsRead(currentUser.id, notificationIds);
}
