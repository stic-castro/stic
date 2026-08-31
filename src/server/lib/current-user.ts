import { NextRequest } from 'next/server';
import { SessionUser } from './auth';
import { createSupabaseRequestClient, createSupabaseServerClient } from './supabase/server';
import { UserService } from '../services/users.service';

function toSessionUser(user: Awaited<ReturnType<typeof UserService.getById>>): SessionUser | null {
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

export async function getCurrentUserFromCookies(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  return toSessionUser(await UserService.getById(data.claims.sub));
}

export async function getCurrentUserFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const supabase = createSupabaseRequestClient(request);
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  return toSessionUser(await UserService.getById(data.claims.sub));
}
