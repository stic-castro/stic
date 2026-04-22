export interface BaseEntity {
  id: string; // uuid
  created_at: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'mechanic' | 'trainee';
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface Mechanic extends BaseEntity {
  name: string;
  email: string;
  phone: string;
}

export interface Car extends BaseEntity {
  user_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
}

export interface Job extends BaseEntity {
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  mechanic_id: string;
  car_id: string;
}

export interface JobWithRelations extends Job {
  car_plate: string;
  car_brand: string;
  car_model: string;
  car_owner_id: string;
  car_owner_name: string | null;
  car_owner_email: string | null;
  car_owner_phone: string | null;
  mechanic_name: string | null;
  mechanic_email: string | null;
  mechanic_phone: string | null;
}

export interface ProgressLog extends BaseEntity {
  job_id: string;
  description: string;
  started_at: string;
  ended_at: string | null;
}

export interface Notification extends BaseEntity {
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
}
