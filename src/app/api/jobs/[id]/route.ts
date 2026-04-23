import { NextRequest } from 'next/server';
import { getCurrentUserFromRequest } from '../../../../server/lib/current-user';
import { JobController } from '../../../../server/controllers/jobs.controller';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return JobController.updateJob(request, id, await getCurrentUserFromRequest(request));
}
