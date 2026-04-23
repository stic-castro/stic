export interface Job {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  payment_status: 'pending_payment' | 'paid';
  mechanic_id: string;
  car_id: string;
  created_at: string;
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
  mechanic_review_rating: number | null;
  mechanic_review_comment: string | null;
  mechanic_reviewed_at: string | null;
}

export interface ProgressLog {
  id: string;
  job_id: string;
  description: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  job_id: string | null;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
}

export interface Mechanic {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export type CreateJobDTO = Pick<Job, 'description' | 'mechanic_id' | 'car_id'>;
export type CreateProgressLogDTO = Pick<ProgressLog, 'job_id' | 'description' | 'started_at' | 'ended_at'> & {
  complete_job?: boolean;
};

export type UpdateJobDTO = {
  status?: Job['status'];
  payment_status?: Job['payment_status'];
  mechanic_review_rating?: number;
  mechanic_review_comment?: string;
};
