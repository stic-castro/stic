import { NextRequest, NextResponse } from 'next/server';
import { SessionUser } from '../lib/auth';
import { createNotification } from '../services/notifications.service';
import {
  JobService,
  getVisibleJobs,
  updateJobMechanicReview,
  updateJobPaymentStatus,
  updateJobStatus,
} from '../services/jobs.service';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export const JobController = {
  getAllJobs: async (currentUser?: SessionUser | null) => {
    try {
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const jobs = await getVisibleJobs(currentUser);
      return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },

  createNewJob: async (req: NextRequest | Request, currentUser?: SessionUser | null) => {
    try {
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      if (currentUser.role !== 'mechanic' && currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'Only mechanics and admins can create jobs' }, { status: 403 });
      }

      const body = await req.json().catch(() => null);

      if (!body) {
        return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 });
      }

      const { description, mechanic_id, car_id } = body;
      const effectiveMechanicId = currentUser.role === 'mechanic' ? currentUser.id : mechanic_id;

      if (!description || !effectiveMechanicId || !car_id) {
        return NextResponse.json(
          { error: 'Missing required fields (description, mechanic_id, car_id)' },
          { status: 400 }
        );
      }

      const newJob = await JobService.create({ description, mechanic_id: effectiveMechanicId, car_id });
      
      return NextResponse.json(newJob, { status: 201 });
      
    } catch (error: unknown) {
      console.error('Error creating job:', error);
      const message = getErrorMessage(error);
      
      if (
        message === 'Description cannot be empty' ||
        message === 'Mechanic ID is required' ||
        message === 'Car ID is required' ||
        message === 'Assigned mechanic must be an existing user with mechanic role'
      ) {
         return NextResponse.json({ error: message }, { status: 400 });
      }

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },

  updateJob: async (req: NextRequest | Request, jobId: string, currentUser?: SessionUser | null) => {
    try {
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const body = await req.json().catch(() => null);

      if (!body) {
        return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 });
      }

      const visibleJobs = await getVisibleJobs(currentUser);
      const targetJob = visibleJobs.find((job) => job.id === jobId);

      if (!targetJob) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      if (body.status) {
        const canCompleteJob =
          currentUser.role === 'admin' ||
          (currentUser.role === 'mechanic' && currentUser.id === targetJob.mechanic_id);

        if (!canCompleteJob) {
          return NextResponse.json({ error: 'Only the assigned mechanic or an admin can update this job status' }, { status: 403 });
        }

        if (body.status !== 'completed') {
          return NextResponse.json({ error: 'Only completing a job is supported here' }, { status: 400 });
        }

        const updatedJob = await updateJobStatus(jobId, 'completed');

        if (targetJob.status !== 'completed') {
          await createNotification({
            user_id: targetJob.car_owner_id,
            job_id: targetJob.id,
            title: 'Job completed',
            message: `${targetJob.car_brand} ${targetJob.car_model} (${targetJob.car_plate}) has been completed.`,
          });
        }

        return NextResponse.json(updatedJob, { status: 200 });
      }

      if (body.payment_status) {
        if (currentUser.role !== 'admin') {
          return NextResponse.json({ error: 'Only admins can update payment status' }, { status: 403 });
        }

        if (body.payment_status !== 'paid') {
          return NextResponse.json({ error: 'Only marking a job as paid is supported here' }, { status: 400 });
        }

        const updatedJob = await updateJobPaymentStatus(jobId, 'paid');
        return NextResponse.json(updatedJob, { status: 200 });
      }

      if (body.mechanic_review_rating) {
        if (currentUser.role !== 'user' || currentUser.id !== targetJob.car_owner_id) {
          return NextResponse.json({ error: 'Only the vehicle owner can leave a review' }, { status: 403 });
        }

        if (targetJob.status !== 'completed') {
          return NextResponse.json({ error: 'Reviews can only be added after the job is completed' }, { status: 400 });
        }

        const updatedJob = await updateJobMechanicReview(jobId, {
          mechanic_review_rating: body.mechanic_review_rating,
          mechanic_review_comment: body.mechanic_review_comment,
        });
        return NextResponse.json(updatedJob, { status: 200 });
      }

      return NextResponse.json({ error: 'No supported job update was provided' }, { status: 400 });
    } catch (error: unknown) {
      console.error('Error updating job:', error);
      const message = getErrorMessage(error);

      if (
        message === 'Job ID is required' ||
        message === 'Job not found' ||
        message === 'Mechanic review rating must be between 1 and 5'
      ) {
        return NextResponse.json({ error: message }, { status: 400 });
      }

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
};
