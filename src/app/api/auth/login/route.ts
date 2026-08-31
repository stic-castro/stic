import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '../../../../server/lib/supabase/server';
import { userRepository } from '../../../../server/repositories/users.repository';

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

    const normalizedIdentifier = identifier.trim();
    const email = normalizedIdentifier.includes('@')
      ? normalizedIdentifier
      : (await userRepository.findByPhone(normalizedIdentifier))?.email;

    if (!email) {
      return NextResponse.json({ error: 'Invalid email, phone, or password' }, { status: 401 });
    }

    const { supabase, withCookies } = createSupabaseRouteHandlerClient(request);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return withCookies(NextResponse.json({ error: 'Invalid email, phone, or password' }, { status: 401 }));
    }

    const user = await userRepository.findById(data.user.id);

    if (!user) {
      await supabase.auth.signOut();
      return withCookies(NextResponse.json({ error: 'User profile not found' }, { status: 403 }));
    }

    return withCookies(NextResponse.json(user, { status: 200 }));
  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
