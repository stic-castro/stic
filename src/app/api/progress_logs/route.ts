import { NextRequest } from 'next/server';
import { getCurrentUserFromRequest } from '../../../server/lib/current-user';
import { ProgressLogController } from '../../../server/controllers/progress_logs.controller';

export async function GET(request: NextRequest) {
  return ProgressLogController.getAll(await getCurrentUserFromRequest(request));
}

export async function POST(request: NextRequest) {
  return ProgressLogController.create(request, await getCurrentUserFromRequest(request));
}
