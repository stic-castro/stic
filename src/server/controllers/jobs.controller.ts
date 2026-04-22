import { NextRequest, NextResponse } from 'next/server';
import { SessionUser } from '../lib/auth';
import { JobService, getVisibleJobs } from '../services/jobs.service';

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
      
    } catch (error: any) {
      console.error('Error creating job:', error);
      
      if (
        error?.message === 'Description cannot be empty' ||
        error?.message === 'Mechanic ID is required' ||
        error?.message === 'Car ID is required' ||
        error?.message === 'Assigned mechanic must be an existing user with mechanic role'
      ) {
         return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
};
