import { NextRequest } from 'next/server';
import { getCurrentUserFromRequest } from '../../../server/lib/current-user';
import { NotificationController } from '../../../server/controllers/notifications.controller';

export async function GET(request: NextRequest) {
  return NotificationController.getAll(await getCurrentUserFromRequest(request));
}

export async function POST(request: NextRequest) {
  return NotificationController.create(request, await getCurrentUserFromRequest(request));
}

export async function PATCH(request: NextRequest) {
  return NotificationController.markAllRead(request, await getCurrentUserFromRequest(request));
}
