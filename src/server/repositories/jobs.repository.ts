import { BaseRepository } from './base.repository';
import { Job, JobWithRelations, User } from '../types';
import { db } from '../lib/db';

export class JobRepositoryImpl extends BaseRepository<Job> {
  constructor() {
    super('jobs');
  }

  async create(data: Omit<Job, 'id' | 'created_at'>): Promise<Job> {
    const query = `
      INSERT INTO jobs (
        description,
        status,
        payment_status,
        mechanic_id,
        car_id,
        mechanic_review_rating,
        mechanic_review_comment,
        mechanic_reviewed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.description,
      data.status,
      data.payment_status,
      data.mechanic_id,
      data.car_id,
      data.mechanic_review_rating,
      data.mechanic_review_comment,
      data.mechanic_reviewed_at,
    ];
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
      LEFT JOIN profiles mechanic ON mechanic.id = j.mechanic_id
      LEFT JOIN profiles owner ON owner.id = c.user_id
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

  async updatePaymentStatus(id: string, paymentStatus: Job['payment_status']): Promise<Job | null> {
    const query = `
      UPDATE jobs
      SET payment_status = $2
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [id, paymentStatus]);
    return result.rows[0] ?? null;
  }

  async updateMechanicReview(
    id: string,
    review: Pick<Job, 'mechanic_review_rating' | 'mechanic_review_comment' | 'mechanic_reviewed_at'>
  ): Promise<Job | null> {
    const query = `
      UPDATE jobs
      SET
        mechanic_review_rating = $2,
        mechanic_review_comment = $3,
        mechanic_reviewed_at = $4
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [
      id,
      review.mechanic_review_rating,
      review.mechanic_review_comment,
      review.mechanic_reviewed_at,
    ]);
    return result.rows[0] ?? null;
  }
}

export const JobRepository = new JobRepositoryImpl();
