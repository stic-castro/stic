import { BaseRepository } from './base.repository';
import { Notification, User } from '../types';
import { db } from '../lib/db';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super('notifications');
  }

  async create(data: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, job_id, title, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [data.user_id, data.job_id, data.title, data.message]);
    return result.rows[0];
  }

  async findVisible(currentUser: Pick<User, 'id' | 'role'>): Promise<Notification[]> {
    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = $1 AND is_read = FALSE
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [currentUser.id]);
    return result.rows;
  }

  async markAsRead(userId: string, notificationIds?: string[]): Promise<void> {
    if (notificationIds && notificationIds.length > 0) {
      await db.query(
        `
          UPDATE notifications
          SET is_read = TRUE
          WHERE user_id = $1 AND id = ANY($2::uuid[]) AND is_read = FALSE
        `,
        [userId, notificationIds]
      );
      return;
    }

    await db.query(
      `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1 AND is_read = FALSE
      `,
      [userId]
    );
  }
}

export const notificationRepository = new NotificationRepository();
