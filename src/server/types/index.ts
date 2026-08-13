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
  payment_status: 'pending_payment' | 'paid';
  mechanic_id: string;
  car_id: string;
  mechanic_review_rating: number | null;
  mechanic_review_comment: string | null;
  mechanic_reviewed_at: string | null;
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
  job_id: string | null;
}

export interface TimeEntry extends BaseEntity {
  user_id: string;
  checked_in_at: string;
  checked_out_at: string | null;
  checked_in_by: string;
  checked_out_by: string | null;
}

export interface TimeEntryWithRelations extends TimeEntry {
  user_name: string;
  user_email: string;
  user_role: User['role'];
  checked_in_by_name: string | null;
  checked_out_by_name: string | null;
}
