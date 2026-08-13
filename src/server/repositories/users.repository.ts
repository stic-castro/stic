import { BaseRepository } from './base.repository';
import { User, UserWithPassword } from '../types';
import { db } from '../lib/db';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const query = `
      SELECT id, name, email, phone, role, password_hash, created_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] ?? null;
  }

  async findByPhone(phone: string): Promise<UserWithPassword | null> {
    const query = `
      SELECT id, name, email, phone, role, password_hash, created_at
      FROM users
      WHERE phone = $1
      LIMIT 1
    `;
    const result = await db.query(query, [phone]);
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] ?? null;
  }

  async findByRoles(roles: User['role'][]): Promise<User[]> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM users
      WHERE role = ANY($1::text[])
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [roles]);
    return result.rows;
  }

  async findMonitoringUsers(): Promise<User[]> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM users
      WHERE role = 'user'
      ORDER BY name ASC, created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async findTimeTrackingUsers(): Promise<User[]> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM users
      WHERE role = ANY($1::text[])
      ORDER BY
        CASE role WHEN 'mechanic' THEN 1 WHEN 'trainee' THEN 2 ELSE 3 END,
        name ASC,
        created_at DESC
    `;
    const result = await db.query(query, [['mechanic', 'trainee']]);
    return result.rows;
  }

  async updateRole(id: string, role: User['role']): Promise<User | null> {
    const query = `
      UPDATE users
      SET role = $2
      WHERE id = $1
      RETURNING id, name, email, phone, role, created_at
    `;
    const result = await db.query(query, [id, role]);
    return result.rows[0] ?? null;
  }

  async create(data: Omit<UserWithPassword, 'id' | 'created_at'>): Promise<User> {
    const query = `
      INSERT INTO users (name, email, phone, role, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, role, created_at
    `;
    const values = [data.name, data.email, data.phone, data.role, data.password_hash];
    const result = await db.query(query, values);
    return result.rows[0];
  }
}

export const userRepository = new UserRepository();
