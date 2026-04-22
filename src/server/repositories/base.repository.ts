import { db } from '../lib/db';

export abstract class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findAll(): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`;
    const result = await db.query(query);
    return result.rows;
  }

  // Children will implement custom logic for create because column names differ
  abstract create(item: any): Promise<T>;
}
