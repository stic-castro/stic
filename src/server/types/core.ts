/**
 * Base Repository Interface for all entities
 */
export interface IRepository<T> {
  findAll(): Promise<T[]>;
  create(item: T): Promise<T>;
  // Future methods:
  // findById(id: string): Promise<T | null>;
  // update(id: string, item: Partial<T>): Promise<T | null>;
  // delete(id: string): Promise<boolean>;
}

/**
 * Base Service Interface for all entities
 */
export interface IService<T, CreateDTO> {
  getAll(): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  // Future methods:
  // getById(id: string): Promise<T | null>;
  // update(id: string, data: Partial<CreateDTO>): Promise<T | null>;
  // delete(id: string): Promise<boolean>;
}
