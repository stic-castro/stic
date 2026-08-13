import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { User } from '../types';

export const SESSION_COOKIE_NAME = 'stic_session';
const SESSION_SECRET = process.env.AUTH_SECRET || 'stic-local-dev-secret';

export type SessionUser = Pick<User, 'id' | 'email' | 'phone' | 'role' | 'name'>;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalKey] = storedHash.split(':');

  if (!salt || !originalKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalKey, 'hex');

  if (derivedKey.length !== originalBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, originalBuffer);
}

function signPayload(payload: string): string {
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

export function createSessionCookieValue(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function readSessionCookieValue(cookieValue?: string): SessionUser | null {
  if (!cookieValue) {
    return null;
  }

  const [payload, signature] = cookieValue.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);

  if (expectedSignature.length !== signature.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionUser;

    if (
      typeof session?.id !== 'string' ||
      typeof session?.name !== 'string' ||
      typeof session?.email !== 'string' ||
      typeof session?.phone !== 'string' ||
      typeof session?.role !== 'string'
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}
