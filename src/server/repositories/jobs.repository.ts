import { BaseRepository } from './base.repository';
import { Job, JobWithRelations, User } from '../types';
import { db } from '../lib/db';

export class JobRepositoryImpl extends BaseRepository<Job> {
  constructor() {
    super('jobs');
  }

  async create(data: Omit<Job, 'id' | 'created_at'>): Promise<Job> {
    const query = `
      INSERT INTO jobs (description, status, mechanic_id, car_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [data.description, data.status, data.mechanic_id, data.car_id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async findVisible(currentUser: Pick<User, 'id' | 'role'>): Promise<JobWithRelations[]> {
    const baseQuery = `
      SELECT
        j.*,
        c.plate AS car_plate,
        c.brand AS car_brand,
        c.model AS car_model,
        c.user_id AS car_owner_id,
        owner.name AS car_owner_name,
        owner.email AS car_owner_email,
        owner.phone AS car_owner_phone,
        mechanic.name AS mechanic_name,
        mechanic.email AS mechanic_email,
        mechanic.phone AS mechanic_phone
      FROM jobs j
      INNER JOIN cars c ON c.id = j.car_id
      LEFT JOIN users mechanic ON mechanic.id = j.mechanic_id
      LEFT JOIN users owner ON owner.id = c.user_id
    `;

    if (currentUser.role === 'admin') {
      const result = await db.query(`${baseQuery} ORDER BY j.created_at DESC`);
      return result.rows;
    }

    if (currentUser.role === 'mechanic' || currentUser.role === 'trainee') {
      const result = await db.query(
        `${baseQuery} WHERE j.mechanic_id = $1 ORDER BY j.created_at DESC`,
        [currentUser.id]
      );
      return result.rows;
    }

    const result = await db.query(
      `${baseQuery} WHERE c.user_id = $1 ORDER BY j.created_at DESC`,
      [currentUser.id]
    );
    return result.rows;
  }

  async updateStatus(id: string, status: Job['status']): Promise<Job | null> {
    const query = `
      UPDATE jobs
      SET status = $2
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [id, status]);
    return result.rows[0] ?? null;
  }
}

export const JobRepository = new JobRepositoryImpl();
