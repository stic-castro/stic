import { NextRequest } from 'next/server';
import { TimeEntryController } from '../../../server/controllers/time_entries.controller';
import { getCurrentUserFromRequest } from '../../../server/lib/current-user';

export async function GET(request: NextRequest) {
  return TimeEntryController.getAll(request, await getCurrentUserFromRequest(request));
}
