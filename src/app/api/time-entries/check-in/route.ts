import { NextRequest } from 'next/server';
import { TimeEntryController } from '../../../../server/controllers/time_entries.controller';
import { getCurrentUserFromRequest } from '../../../../server/lib/current-user';

export async function POST(request: NextRequest) {
  return TimeEntryController.checkIn(request, await getCurrentUserFromRequest(request));
}
