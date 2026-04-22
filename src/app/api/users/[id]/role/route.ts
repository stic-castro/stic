import { NextRequest } from 'next/server';
import { UserController } from '../../../../../server/controllers/users.controller';
import { getCurrentUserFromRequest } from '../../../../../server/lib/current-user';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return UserController.updateRole(request, id, await getCurrentUserFromRequest(request));
}
