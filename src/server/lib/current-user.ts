import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { readSessionCookieValue, SESSION_COOKIE_NAME, SessionUser } from './auth';
import { UserService } from '../services/users.service';

export async function getCurrentUserFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = readSessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return null;
  }

  const user = await UserService.getById(session.id);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export async function getCurrentUserFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const session = readSessionCookieValue(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return null;
  }

  const user = await UserService.getById(session.id);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}
