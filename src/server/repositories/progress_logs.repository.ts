import { BaseRepository } from './base.repository';
import { ProgressLog, User } from '../types';
import { db } from '../lib/db';

export class ProgressLogRepository extends BaseRepository<ProgressLog> {
  constructor() {
    super('progress_logs');
  }

  async create(data: Omit<ProgressLog, 'id' | 'created_at'>): Promise<ProgressLog> {
    const query = `
      INSERT INTO progress_logs (job_id, description, started_at, ended_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [data.job_id, data.description, data.started_at, data.ended_at];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async findVisible(currentUser: Pick<User, 'id' | 'role'>): Promise<ProgressLog[]> {
    const baseQuery = `
      SELECT pl.*
      FROM progress_logs pl
      INNER JOIN jobs j ON j.id = pl.job_id
      INNER JOIN cars c ON c.id = j.car_id
    `;

    if (currentUser.role === 'admin') {
      const result = await db.query(`${baseQuery} ORDER BY pl.started_at ASC, pl.created_at ASC`);
      return result.rows;
    }

    if (currentUser.role === 'mechanic' || currentUser.role === 'trainee') {
      const result = await db.query(
        `${baseQuery} WHERE j.mechanic_id = $1 ORDER BY pl.started_at ASC, pl.created_at ASC`,
        [currentUser.id]
      );
      return result.rows;
    }

    const result = await db.query(
      `${baseQuery} WHERE c.user_id = $1 ORDER BY pl.started_at ASC, pl.created_at ASC`,
      [currentUser.id]
    );
    return result.rows;
  }
}

export const progressLogRepository = new ProgressLogRepository();
