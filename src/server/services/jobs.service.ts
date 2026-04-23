import { JobRepository } from '../repositories/jobs.repository';
import { userRepository } from '../repositories/users.repository';
import { Job, JobWithRelations, User } from '../types';
import { IService } from '../types/core';

export type CreateJobDTO = {
  description: string;
  mechanic_id: string;
  car_id: string;
};

export type UpdateJobDTO = {
  status?: Job['status'];
  payment_status?: Job['payment_status'];
  mechanic_review_rating?: number;
  mechanic_review_comment?: string;
};

export const JobService: IService<Job, CreateJobDTO> = {
  getAll: async (): Promise<Job[]> => {
    return await JobRepository.findAll();
  },

  create: async (data: CreateJobDTO): Promise<Job> => {
    const { description, mechanic_id, car_id } = data;

    if (!description || description.trim() === '') {
      throw new Error('Description cannot be empty');
    }
    if (!mechanic_id || mechanic_id.trim() === '') {
      throw new Error('Mechanic ID is required');
    }
    if (!car_id || car_id.trim() === '') {
      throw new Error('Car ID is required');
    }

    const assignedMechanic = await userRepository.findById(mechanic_id.trim());

    if (!assignedMechanic || assignedMechanic.role !== 'mechanic') {
      throw new Error('Assigned mechanic must be an existing user with mechanic role');
    }

    return await JobRepository.create({
      description: description.trim(),
      status: 'pending',
      payment_status: 'pending_payment',
      mechanic_id: mechanic_id.trim(),
      car_id: car_id.trim(),
      mechanic_review_rating: null,
      mechanic_review_comment: null,
      mechanic_reviewed_at: null,
    });
  },
};

export async function getVisibleJobs(currentUser: Pick<User, 'id' | 'role'>): Promise<JobWithRelations[]> {
  return JobRepository.findVisible(currentUser);
}

export async function updateJobStatus(jobId: string, status: Job['status']): Promise<Job> {
  if (!jobId || jobId.trim() === '') {
    throw new Error('Job ID is required');
  }

  const updatedJob = await JobRepository.updateStatus(jobId.trim(), status);

  if (!updatedJob) {
    throw new Error('Job not found');
  }

  return updatedJob;
}

export async function updateJobPaymentStatus(jobId: string, paymentStatus: Job['payment_status']): Promise<Job> {
  if (!jobId || jobId.trim() === '') {
    throw new Error('Job ID is required');
  }

  const updatedJob = await JobRepository.updatePaymentStatus(jobId.trim(), paymentStatus);

  if (!updatedJob) {
    throw new Error('Job not found');
  }

  return updatedJob;
}

export async function updateJobMechanicReview(
  jobId: string,
  review: Pick<Job, 'mechanic_review_rating' | 'mechanic_review_comment'>
): Promise<Job> {
  if (!jobId || jobId.trim() === '') {
    throw new Error('Job ID is required');
  }

  if (!review.mechanic_review_rating || review.mechanic_review_rating < 1 || review.mechanic_review_rating > 5) {
    throw new Error('Mechanic review rating must be between 1 and 5');
  }

  const updatedJob = await JobRepository.updateMechanicReview(jobId.trim(), {
    mechanic_review_rating: review.mechanic_review_rating,
    mechanic_review_comment: review.mechanic_review_comment?.trim() || null,
    mechanic_reviewed_at: new Date().toISOString(),
  });

  if (!updatedJob) {
    throw new Error('Job not found');
  }

  return updatedJob;
}
