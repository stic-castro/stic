import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookieValue, getSessionCookieOptions, SESSION_COOKIE_NAME } from '../../../../server/lib/auth';
import { authenticateUser } from '../../../../server/services/users.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 });
    }

    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Missing required fields (identifier, password)' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(identifier, password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email, phone, or password' }, { status: 401 });
    }

    const response = NextResponse.json(user, { status: 200 });
    response.cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(user), getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
