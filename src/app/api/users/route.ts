import { NextRequest } from 'next/server';
import { getCurrentUserFromRequest } from '../../../server/lib/current-user';
import { UserController } from '../../../server/controllers/users.controller';

export async function GET(request: NextRequest) {
  return UserController.getAll(request, await getCurrentUserFromRequest(request));
}

export async function POST(request: NextRequest) {
  return UserController.create(request, await getCurrentUserFromRequest(request));
}
