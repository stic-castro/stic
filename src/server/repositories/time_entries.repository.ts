import { db } from '../lib/db';
import { TimeEntryWithRelations } from '../types';

export type TimeEntryFilters = {
  userId?: string;
  from?: string;
  to?: string;
};

export class TimeEntryRepository {
  private readonly selectWithRelations = `
    SELECT
      te.id,
      te.user_id,
      te.checked_in_at,
      te.checked_out_at,
      te.checked_in_by,
      te.checked_out_by,
      te.created_at,
      u.name AS user_name,
      u.email AS user_email,
      u.role AS user_role,
      checked_in_user.name AS checked_in_by_name,
      checked_out_user.name AS checked_out_by_name
    FROM time_entries te
    INNER JOIN profiles u ON u.id = te.user_id
    INNER JOIN profiles checked_in_user ON checked_in_user.id = te.checked_in_by
    LEFT JOIN profiles checked_out_user ON checked_out_user.id = te.checked_out_by
  `;

  async find(filters: TimeEntryFilters = {}): Promise<TimeEntryWithRelations[]> {
    const conditions: string[] = [];
    const values: string[] = [];

    if (filters.userId) {
      values.push(filters.userId);
      conditions.push(`te.user_id = $${values.length}`);
    }

    if (filters.from) {
      values.push(filters.from);
      conditions.push(`te.checked_in_at >= $${values.length}`);
    }

    if (filters.to) {
      values.push(filters.to);
      conditions.push(`te.checked_in_at <= $${values.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(
      `
        ${this.selectWithRelations}
        ${where}
        ORDER BY te.checked_in_at DESC
      `,
      values
    );

    return result.rows;
  }

  async findOpenByUserId(userId: string): Promise<TimeEntryWithRelations | null> {
    const result = await db.query(
      `
        ${this.selectWithRelations}
        WHERE te.user_id = $1 AND te.checked_out_at IS NULL
        LIMIT 1
      `,
      [userId]
    );

    return result.rows[0] ?? null;
  }

  async findOpenByUserIds(userIds: string[]): Promise<TimeEntryWithRelations[]> {
    if (userIds.length === 0) {
      return [];
    }

    const result = await db.query(
      `
        ${this.selectWithRelations}
        WHERE te.user_id = ANY($1::uuid[]) AND te.checked_out_at IS NULL
        ORDER BY te.checked_in_at DESC
      `,
      [userIds]
    );

    return result.rows;
  }

  async createCheckIn(userId: string, checkedInBy: string): Promise<TimeEntryWithRelations> {
    const result = await db.query(
      `
        WITH inserted AS (
          INSERT INTO time_entries (user_id, checked_in_at, checked_in_by)
          VALUES ($1, NOW(), $2)
          RETURNING *
        )
        SELECT
          inserted.id,
          inserted.user_id,
          inserted.checked_in_at,
          inserted.checked_out_at,
          inserted.checked_in_by,
          inserted.checked_out_by,
          inserted.created_at,
          u.name AS user_name,
          u.email AS user_email,
          u.role AS user_role,
          checked_in_user.name AS checked_in_by_name,
          NULL::text AS checked_out_by_name
        FROM inserted
        INNER JOIN profiles u ON u.id = inserted.user_id
        INNER JOIN profiles checked_in_user ON checked_in_user.id = inserted.checked_in_by
      `,
      [userId, checkedInBy]
    );

    return result.rows[0];
  }

  async checkOut(openEntryId: string, checkedOutBy: string): Promise<TimeEntryWithRelations> {
    const result = await db.query(
      `
        WITH updated AS (
          UPDATE time_entries
          SET checked_out_at = NOW(), checked_out_by = $2
          WHERE id = $1 AND checked_out_at IS NULL
          RETURNING *
        )
        SELECT
          updated.id,
          updated.user_id,
          updated.checked_in_at,
          updated.checked_out_at,
          updated.checked_in_by,
          updated.checked_out_by,
          updated.created_at,
          u.name AS user_name,
          u.email AS user_email,
          u.role AS user_role,
          checked_in_user.name AS checked_in_by_name,
          checked_out_user.name AS checked_out_by_name
        FROM updated
        INNER JOIN profiles u ON u.id = updated.user_id
        INNER JOIN profiles checked_in_user ON checked_in_user.id = updated.checked_in_by
        LEFT JOIN profiles checked_out_user ON checked_out_user.id = updated.checked_out_by
      `,
      [openEntryId, checkedOutBy]
    );

    return result.rows[0];
  }
}

export const timeEntryRepository = new TimeEntryRepository();
