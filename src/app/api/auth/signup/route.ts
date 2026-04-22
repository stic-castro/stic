import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookieValue, getSessionCookieOptions, SESSION_COOKIE_NAME } from '../../../../server/lib/auth';
import { getCurrentUserFromRequest } from '../../../../server/lib/current-user';
import { UserService } from '../../../../server/services/users.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 });
    }

    const { name, email, phone, role, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields (name, email, phone, password)' },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUserFromRequest(request);
    const user = await UserService.create({ name, email, phone, role, password }, { requestedBy: currentUser });
    const response = NextResponse.json(user, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(user), getSessionCookieOptions());
    return response;
  } catch (error: unknown) {
    console.error('Error signing up user:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status =
      message === 'Name cannot be empty' ||
      message === 'Email cannot be empty' ||
      message === 'Phone cannot be empty' ||
      message === 'Role must be one of: user, admin, mechanic, trainee' ||
      message === 'Only admins can assign admin, mechanic, or trainee roles' ||
      message === 'Password must be at least 8 characters long'
        ? message.includes('Only admins') ? 403 : 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
