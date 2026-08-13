import { NextRequest, NextResponse } from 'next/server';
import { SessionUser } from '../lib/auth';
import { createNotification } from '../services/notifications.service';
import { getVisibleJobs } from '../services/jobs.service';
import { updateJobStatus } from '../services/jobs.service';
import { ProgressLogService, getVisibleProgressLogs } from '../services/progress_logs.service';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export const ProgressLogController = {
  getAll: async (currentUser?: SessionUser | null) => {
    try {
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const logs = await getVisibleProgressLogs(currentUser);
      return NextResponse.json(logs, { status: 200 });
    } catch (error) {
      console.error('Error fetching progress logs:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },

  create: async (req: NextRequest | Request, currentUser?: SessionUser | null) => {
    try {
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      if (currentUser.role !== 'mechanic' && currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'Only mechanics and admins can add progress logs' }, { status: 403 });
      }

      const body = await req.json().catch(() => null);

      if (!body) {
        return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 });
      }

      const { job_id, description, started_at, ended_at, complete_job } = body;

      if (!job_id || !description || !started_at) {
        return NextResponse.json(
          { error: 'Missing required fields (job_id, description, started_at)' },
          { status: 400 }
        );
      }

      if (currentUser.role === 'mechanic') {
        const visibleJobs = await getVisibleJobs(currentUser);
        const ownsJob = visibleJobs.some((job) => job.id === job_id);

        if (!ownsJob) {
          return NextResponse.json({ error: 'Mechanics can only update their own jobs' }, { status: 403 });
        }
      }

      const visibleJobs = await getVisibleJobs(currentUser);
      const targetJob = visibleJobs.find((job) => job.id === job_id);

      if (!targetJob) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const newLog = await ProgressLogService.create({ job_id, description, started_at, ended_at });

      if (complete_job) {
        await updateJobStatus(job_id, 'completed');
        await createNotification({
          user_id: targetJob.car_owner_id,
          job_id: targetJob.id,
          title: 'Job completed',
          message: `${targetJob.car_brand} ${targetJob.car_model} (${targetJob.car_plate}) has been completed.`,
        });
      } else if (targetJob.status === 'pending') {
        await updateJobStatus(job_id, 'in_progress');
      }

      return NextResponse.json(newLog, { status: 201 });
      
    } catch (error: unknown) {
      console.error('Error creating progress log:', error);
      const message = getErrorMessage(error);
      if (
        message === 'Missing required fields for progress log' ||
        message === 'End time is required for progress log' ||
        message === 'Progress log times must be valid dates' ||
        message === 'End time must be after start time'
      ) {
         return NextResponse.json({ error: message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
};
