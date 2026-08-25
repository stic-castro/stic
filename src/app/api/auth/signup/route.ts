import { NextRequest, NextResponse } from 'next/server';
import { allowedRoles } from '../../../../server/lib/auth';
import { getCurrentUserFromRequest } from '../../../../server/lib/current-user';
import { createSupabaseRouteHandlerClient } from '../../../../server/lib/supabase/server';
import { userRepository } from '../../../../server/repositories/users.repository';
import { UserService } from '../../../../server/services/users.service';
import { User } from '../../../../server/types';

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

    const requestedRole = (role ?? 'user') as User['role'];

    if (!allowedRoles.includes(requestedRole)) {
      return NextResponse.json({ error: 'Role must be one of: user, admin, mechanic, trainee' }, { status: 400 });
    }

    const currentUser = await getCurrentUserFromRequest(request);

    if (requestedRole !== 'user') {
      const user = await UserService.create(
        { name, email, phone, role: requestedRole, password },
        { requestedBy: currentUser }
      );
      return NextResponse.json(user, { status: 201 });
    }

    const { supabase, withCookies } = createSupabaseRouteHandlerClient(request);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          phone: phone.trim(),
          role: 'user',
        },
      },
    });

    if (error) {
      return withCookies(NextResponse.json({ error: error.message }, { status: 400 }));
    }

    if (!data.user?.id || !data.user.email) {
      return withCookies(NextResponse.json({ error: 'Supabase Auth did not return a user' }, { status: 500 }));
    }

    const user = await userRepository.upsert({
      id: data.user.id,
      name: name.trim(),
      email: data.user.email,
      phone: phone.trim(),
      role: 'user',
    });

    return withCookies(NextResponse.json(
      { ...user, requiresEmailConfirmation: !data.session },
      { status: 201 }
    ));
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
