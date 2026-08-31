import { BaseRepository } from './base.repository';
import { User } from '../types';
import { db } from '../lib/db';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('profiles');
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM profiles
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM profiles
      WHERE email = $1
      LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] ?? null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM profiles
      WHERE phone = $1
      LIMIT 1
    `;
    const result = await db.query(query, [phone]);
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM profiles
      WHERE id = $1
      LIMIT 1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] ?? null;
  }

  async findByRoles(roles: User['role'][]): Promise<User[]> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM profiles
      WHERE role = ANY($1::text[])
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [roles]);
    return result.rows;
  }

  async findMonitoringUsers(): Promise<User[]> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM profiles
      WHERE role = 'user'
      ORDER BY name ASC, created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async findTimeTrackingUsers(): Promise<User[]> {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM profiles
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
      UPDATE profiles
      SET role = $2
      WHERE id = $1
      RETURNING id, name, email, phone, role, created_at
    `;
    const result = await db.query(query, [id, role]);
    return result.rows[0] ?? null;
  }

  async create(data: Omit<User, 'id' | 'created_at'> & { id: string }): Promise<User> {
    const query = `
      INSERT INTO profiles (id, name, email, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, role, created_at
    `;
    const values = [data.id, data.name, data.email, data.phone, data.role];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async upsert(data: Omit<User, 'created_at'>): Promise<User> {
    const query = `
      INSERT INTO profiles (id, name, email, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE
      SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role
      RETURNING id, name, email, phone, role, created_at
    `;
    const values = [data.id, data.name, data.email, data.phone, data.role];
    const result = await db.query(query, values);
    return result.rows[0];
  }
}

export const userRepository = new UserRepository();
