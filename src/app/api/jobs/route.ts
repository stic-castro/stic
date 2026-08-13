import { NextRequest } from 'next/server';
import { getCurrentUserFromRequest } from '../../../server/lib/current-user';
import { JobController } from '../../../server/controllers/jobs.controller';

export async function GET(request: NextRequest) {
  return JobController.getAllJobs(await getCurrentUserFromRequest(request));
}

export async function POST(request: NextRequest) {
  return JobController.createNewJob(request, await getCurrentUserFromRequest(request));
}
