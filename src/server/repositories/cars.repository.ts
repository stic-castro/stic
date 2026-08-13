import { BaseRepository } from './base.repository';
import { Car, User } from '../types';
import { db } from '../lib/db';

export class CarRepository extends BaseRepository<Car> {
  constructor() {
    super('cars');
  }

  async create(data: Omit<Car, 'id' | 'created_at'>): Promise<Car> {
    const query = `
      INSERT INTO cars (user_id, brand, model, year, plate)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [data.user_id, data.brand, data.model, data.year, data.plate];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async findVisible(currentUser: Pick<User, 'id' | 'role'>): Promise<Car[]> {
    if (currentUser.role === 'admin' || currentUser.role === 'mechanic' || currentUser.role === 'trainee') {
      return this.findAll();
    }

    const query = `
      SELECT *
      FROM cars
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [currentUser.id]);
    return result.rows;
  }
}

export const carRepository = new CarRepository();
